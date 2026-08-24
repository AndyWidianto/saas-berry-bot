import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class MarkReadDto {
  @ApiProperty()
  @IsNotEmpty({ message: "id is required" })
  @IsString()
  id: string; // ID user di database milik Klien (misal: "usr_9988")
}


export type NotificationAction = "CONFIGURE_MODEL" | "LOW_BALANCE_ALERT";

export type NotificationTarget = "billing" | "workspace";