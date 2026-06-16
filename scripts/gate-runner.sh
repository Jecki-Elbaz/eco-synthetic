#!/bin/bash
# PROPOSAL -- not deployed. Deployment is owner A1 per git-sync-autonomous-recommendation.md.
#
# gate-runner.sh -- git mechanics helper for GitSyncRunner
#
# Purpose:
#   Called by GitSyncRunner (via Bash tool) to perform all git operations:
#   fetch, classify, write diff to quarantine dir, perform ff-only merge (on CLEAR
#   only), create quarantine refs. Never merges without being told CLEAR by the
#   calling runner session.
#
# Usage (called with a subcommand):
#   gate-runner.sh fetch
#   gate-runner.sh classify
#   gate-runner.sh diff-to-quarantine <commit-sha>
#   gate-runner.sh merge-ff-only
#   gate-runner.sh quarantine-ref <timestamp>
#   gate-runner.sh check-quarantine-exists <commit-sha>
#
# Each subcommand exits 0 on success, non-zero on failure.
# All output to stdout. Errors to stderr.
#
# Auth: A2 build (Ido). A1 required to deploy or execute on any live repo.
# Rambo clearance required before commit.
#
# NO DESTRUCTIVE COMMANDS. This script never runs:
#   git reset --hard, git push --force, git rebase, rm -rf, DROP TABLE.
# All merges use --ff-only only. See Section 4.1 of runner design.

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration (owner sets REPO_ROOT at bootstrap; path pinned, never
# read from an incoming commit)
# ---------------------------------------------------------------------------
REPO_ROOT="${GIT_SYNC_REPO_ROOT:-/home/user/eco-synthetic}"
AUDIT_LOG="$REPO_ROOT/logs/gate-audit.log"
QUARANTINE_DIR="$REPO_ROOT/logs/quarantine"

# Control-plane pattern (canonical from git-sync-autonomous-recommendation.md
# Section 3.1 -- Ido ruling). Residual rule: anything NOT in the data-plane
# list is also control-plane. That residual check is in the classify subcommand.
CP_PATTERN='^\.claude/|^CLAUDE\.md$|^bridge\.py$|^scripts/|^company/governance/|^company/constitution\.md$'

# Data-plane prefixes (authoritative list from runner design Section 1.2).
# Used for residual classification only -- primary classification uses CP_PATTERN.
DP_PREFIXES=(
    "memory/"
    "projects/"
    "company/processes/"
    "company/decisions/"
    "integrations/"
    "logs/"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

timestamp() {
    date -u +%Y-%m-%dT%H:%M:%SZ
}

log_audit() {
    # Append a line to the audit log. Creates the file and parent dir if absent.
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "$1" >> "$AUDIT_LOG"
}

is_data_plane_path() {
    # Returns 0 (true) if $1 matches any data-plane prefix.
    local f="$1"
    for prefix in "${DP_PREFIXES[@]}"; do
        if [[ "$f" == "$prefix"* ]]; then
            return 0
        fi
    done
    return 1
}

is_control_plane_file() {
    # Returns 0 (true) if $1 is control-plane.
    # Rule 1: matches the explicit CP_PATTERN.
    # Rule 2 (residual): does NOT match any data-plane prefix.
    local f="$1"
    if echo "$f" | grep -qE "$CP_PATTERN"; then
        return 0
    fi
    if ! is_data_plane_path "$f"; then
        return 0   # residual: unknown path -> control-plane
    fi
    return 1
}

die() {
    echo "ERROR: $*" >&2
    exit 1
}

# ---------------------------------------------------------------------------
# Subcommands
# ---------------------------------------------------------------------------

cmd_fetch() {
    cd "$REPO_ROOT"
    git fetch origin
}

cmd_classify() {
    # Outputs two lines:
    #   CONTROL_PLANE_FILES=<space-separated list or empty>
    #   DATA_PLANE_FILES=<space-separated list or empty>
    # Exit 0 always (classification itself does not fail; caller checks output).
    cd "$REPO_ROOT"

    local behind
    behind=$(git rev-list HEAD..origin/master --count 2>/dev/null || echo 0)
    if [ "$behind" -eq 0 ]; then
        echo "BEHIND=0"
        echo "CONTROL_PLANE_FILES="
        echo "DATA_PLANE_FILES="
        exit 0
    fi

    echo "BEHIND=$behind"

    local changed_files
    changed_files=$(git diff HEAD..origin/master --name-only)

    local cp_files=""
    local dp_files=""

    while IFS= read -r f; do
        [ -z "$f" ] && continue
        if is_control_plane_file "$f"; then
            cp_files="$cp_files $f"
        else
            dp_files="$dp_files $f"
        fi
    done <<< "$changed_files"

    # Trim leading space
    cp_files="${cp_files# }"
    dp_files="${dp_files# }"

    echo "CONTROL_PLANE_FILES=$cp_files"
    echo "DATA_PLANE_FILES=$dp_files"
}

cmd_diff_to_quarantine() {
    # Writes the control-plane diff to logs/quarantine/diff-<sha>.txt.
    # Usage: gate-runner.sh diff-to-quarantine <commit-sha>
    # The diff is written against the remote ref by hash -- no checkout.
    local sha="${1:-}"
    [ -z "$sha" ] && die "diff-to-quarantine requires a commit SHA argument"

    cd "$REPO_ROOT"
    mkdir -p "$QUARANTINE_DIR"

    local diff_file="$QUARANTINE_DIR/diff-$sha.txt"

    # Get control-plane file list to limit the diff scope
    local cp_files
    cp_files=$(git diff HEAD..origin/master --name-only | grep -E "$CP_PATTERN" || true)
    # Residual: also include any changed file NOT on the data-plane list
    local all_changed
    all_changed=$(git diff HEAD..origin/master --name-only)
    local residual_files=""
    while IFS= read -r f; do
        [ -z "$f" ] && continue
        if ! echo "$f" | grep -qE "$CP_PATTERN"; then
            if ! is_data_plane_path "$f"; then
                residual_files="$residual_files $f"
            fi
        fi
    done <<< "$all_changed"
    residual_files="${residual_files# }"

    local all_cp=""
    all_cp=$(printf '%s\n%s' "$cp_files" "$residual_files" | grep -v '^$' | sort -u || true)

    if [ -z "$all_cp" ]; then
        # No control-plane files -- should not be called in this case
        echo "NO-CONTROL-PLANE-FILES" > "$diff_file"
    else
        # Write diff of control-plane files only.
        # Using -- to pass file list; xargs handles multi-line list.
        git diff "HEAD..origin/master" -- $all_cp > "$diff_file" 2>&1
    fi

    echo "$diff_file"
}

cmd_merge_ff_only() {
    # Performs git merge --ff-only origin/master.
    # MUST only be called after GitSyncRunner has received VERDICT: CLEAR from Rambo,
    # or confirmed the diff is data-plane only.
    # This function does NOT decide when to merge -- the calling runner decides.
    cd "$REPO_ROOT"

    local ts
    ts=$(timestamp)
    local sha
    sha=$(git rev-parse origin/master)

    git merge --ff-only origin/master
    local merge_exit=$?

    if [ $merge_exit -eq 0 ]; then
        echo "MERGE_OK sha=$sha"
        log_audit "$ts | COMMIT=$sha | ACTION=FF-MERGE-COMPLETE"
    else
        echo "MERGE_FAILED sha=$sha exit=$merge_exit"
        log_audit "$ts | COMMIT=$sha | ACTION=FF-MERGE-FAILED | EXIT=$merge_exit"
        exit 1
    fi
}

cmd_quarantine_ref() {
    # Creates a quarantine ref for origin/master at the given timestamp label.
    # Usage: gate-runner.sh quarantine-ref <timestamp-label>
    # Example label: 2026-06-16T14-30-00Z (colons replaced with hyphens for ref safety)
    local ts_label="${1:-}"
    [ -z "$ts_label" ] && ts_label=$(date -u +%Y-%m-%dT%H-%M-%SZ)

    cd "$REPO_ROOT"

    local qref="refs/quarantine/$ts_label"
    git fetch origin "master:$qref"
    local fetch_exit=$?

    if [ $fetch_exit -eq 0 ]; then
        echo "QUARANTINE_REF=$qref"
    else
        echo "QUARANTINE_REF_FAILED qref=$qref exit=$fetch_exit" >&2
        exit 1
    fi
}

cmd_check_quarantine_exists() {
    # Checks whether a quarantine ref already exists for the given commit SHA.
    # Outputs FOUND=<refname> or FOUND=none.
    # Used to avoid duplicate quarantine refs for the same commit.
    local sha="${1:-}"
    [ -z "$sha" ] && die "check-quarantine-exists requires a commit SHA argument"

    cd "$REPO_ROOT"

    local existing
    existing=$(git for-each-ref refs/quarantine/ --format='%(refname) %(objectname)' \
        | awk -v sha="$sha" '$2 == sha {print $1}' || true)

    if [ -n "$existing" ]; then
        echo "FOUND=$existing"
    else
        echo "FOUND=none"
    fi
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

SUBCOMMAND="${1:-}"

case "$SUBCOMMAND" in
    fetch)                  cmd_fetch ;;
    classify)               cmd_classify ;;
    diff-to-quarantine)     cmd_diff_to_quarantine "${2:-}" ;;
    merge-ff-only)          cmd_merge_ff_only ;;
    quarantine-ref)         cmd_quarantine_ref "${2:-}" ;;
    check-quarantine-exists) cmd_check_quarantine_exists "${2:-}" ;;
    "")                     die "No subcommand given. Usage: gate-runner.sh <subcommand> [args]" ;;
    *)                      die "Unknown subcommand: $SUBCOMMAND" ;;
esac
