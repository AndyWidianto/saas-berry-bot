import { CreateWorkspaceContactDto } from "@library/dto/contact.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { WorkspaceService } from "../workspace/workspace.service";
import { GetQueryDto } from "@library/dto/query.dto";

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private workspaceService: WorkspaceService
  ) { }

  async getAll(user: PayloadJWT, workspaceId: string, { search, limit, cursor }: GetQueryDto) {
    const existingWorkspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);

    const take = limit ? limit : 20;
    const query: Prisma.ContactFindManyArgs = {
      where: {
        workspaceId: existingWorkspace.id,
        ...search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search, mode: "insensitive" } }
          ]
        } : {},
      },
      ...cursor ? {
        cursor: { id: cursor },
        skip: 1,
      } : {},
      take: take,
      orderBy: {
        createdAt: "desc"
      }
    };
    const [contacts, totalContact] = await this.prisma.$transaction([
      this.prisma.contact.findMany(query),
      this.prisma.contact.count({
        where: query.where
      })
    ]);
    return {
      total: totalContact,
      data: contacts,
      totalPage: Math.ceil(totalContact / take),
      nextId: contacts.length >= take ? contacts[contacts.length - 1].id : null
    }
  }

  private formatToSenderId(input: string): { senderId: string; phoneNumber: string } {
    // Clean string (hanya ambil angka dan hilangkan karakter unik)
    let cleaned = input.trim().replace(/[^0-9]/g, '');

    // Ubah awalan 08xxx menjadi 628xxx (Standar Indonesia)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }

    if (!cleaned) {
      throw new BadRequestException('Format nomor telepon tidak valid');
    }

    // Jika input asli sudah berupa JID (misal mengandung @s.whatsapp.net)
    if (input.includes('@s.whatsapp.net')) {
      return {
        senderId: input.trim(),
        phoneNumber: cleaned,
      };
    }

    return {
      senderId: `${cleaned}@s.whatsapp.net`,
      phoneNumber: cleaned,
    };
  }

  async addContactToWorkspace(
    user: PayloadJWT,
    workspaceId: string,
    dto: CreateWorkspaceContactDto
  ) {
    try {
      const existingWorkspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
      const { senderId, phoneNumber } = this.formatToSenderId(dto.phoneOrSenderId);
      const contact = await this.prisma.contact.upsert({
        where: {
          workspaceId_senderId: {
            workspaceId: existingWorkspace.id,
            senderId: senderId,
          },
        },
        update: {
          ...(dto.name && { name: dto.name }),
          ...(dto.avatarUrl && { avatarUrl: dto.avatarUrl }),
          ...(dto.metadata && { metadata: dto.metadata }),
          phoneNumber: phoneNumber,
          lastActiveAt: new Date(),
        },
        create: {
          workspaceId: workspaceId,
          senderId: senderId,
          phoneNumber: phoneNumber,
          name: dto.name || phoneNumber, // Fallback jika nama tidak diisi
          avatarUrl: dto.avatarUrl,
          metadata: dto.metadata || {},
          lastActiveAt: new Date(),
        },
      });
      return {
        message: "Contact berhasil di perbarui.",
        data: contact
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('Error addContactToWorkspace:', error);
      throw new InternalServerErrorException('Gagal menambahkan kontak ke workspace');
    }
  }

  async deleteContact(
    user: PayloadJWT,
    workspaceId: string,
    id: string
  ) {
    await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
    const existingContact = await this.prisma.contact.findUnique({
      where: { id }
    });
    if (!existingContact) {
      throw new NotFoundException("Contact tidak ditemukan.");
    }
    await this.prisma.contact.delete({
      where: { workspaceId, id: existingContact.id }
    });
    return {
      message: "Berhasil menghapus contact",
    }
  }

  async deleteContacts(
    user: PayloadJWT,
    workspaceId: string,
    ids: string[]
  ) {
    await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
    await this.prisma.contact.deleteMany({
      where: {
        id: { in: ids }
      }
    })
    return {
      message: "Berhasil menghapus contact",
    }
  }

  async exportContactsPdf(user: any, workspaceId: string, { limit, search, cursor }: GetQueryDto) {
    try {
      const existingWorkspace = await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
      const query: Prisma.ContactFindManyArgs = {
        where: {
          workspaceId: existingWorkspace.id,
          ...search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phoneNumber: { contains: search, mode: "insensitive" } }
            ]
          } : {},
        },
        ...cursor ? {
          cursor: { id: cursor },
          skip: 1,
        } : {},
        ...limit ? { take: limit } : {},
        orderBy: {
          createdAt: "desc"
        }
      };
      const contacts = await this.prisma.contact.findMany(query);

      return {
        data: contacts,
        message: "Berhasil mengambil data contacts"
      }
    } catch (error: any) {
      throw new InternalServerErrorException(`Gagal export PDF contact: ${error.message}`);
    }
  }
}