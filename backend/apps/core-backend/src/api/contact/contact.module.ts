import { Global, Module } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { ContactController } from "./contact.controller";



@Global()
@Module({
    providers: [ContactService],
    controllers: [ContactController],
    exports: [ContactService]
})
export class ContactModule {}