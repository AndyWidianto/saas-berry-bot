import { GetQueryDto } from "@library/dto/query.dto";
import { CreateUserDto } from "@library/dto/user.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";


@Injectable()
export class UserAdminService {
    constructor(
        private prisma: PrismaService
    ) {}


    async getAll({ limit, cursor } : GetQueryDto) {
        const take = limit ? limit : 20;
        const query: Prisma.UserFindManyArgs = {
            ...(cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {}),
            take: take
        };
        const [users, totalUser] = await this.prisma.$transaction([
            this.prisma.user.findMany(query),
            this.prisma.user.count({
                where: query.where
            })
        ]);
        return {
            data: users,
            total: totalUser,
            totalPage: Math.ceil(totalUser / take),
            nextId: users.length >= take ? users[users.length - 1].id : null
        }
    }

    async createUser(data: CreateUserDto) {
        const existingEmail = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { username: data.username }
                ]
            }
        })
        if (existingEmail) {
            throw new ConflictException(`${data.email === existingEmail.email ? "Email" : "Username"} is already`);
        }
        const newUser = await this.prisma.user.create({
            data: data
        });
        return newUser;
    }
}