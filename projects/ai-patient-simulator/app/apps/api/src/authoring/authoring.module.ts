// AuthoringModule -- wires AuthoringService + AuthoringController
import { Module } from "@nestjs/common";
import { AuthoringService } from "./authoring.service.js";
import { AuthoringController } from "./authoring.controller.js";

@Module({
  providers: [AuthoringService],
  controllers: [AuthoringController],
})
export class AuthoringModule {}
