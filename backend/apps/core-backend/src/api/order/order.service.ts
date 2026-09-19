import { GetQueryDto } from "@library/dto/query.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { PayloadJWT } from "@library/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { WorkspaceService } from "../workspace/workspace.service";
import { OrderStatus, Prisma, Workspace } from "@prisma/client";
import { OrderData, UpdateOrderStatusDto } from "@library/dto/order.dto";



@Injectable()
export class OrderService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly workspaceService: WorkspaceService
    ) { }

    async getAll(user: PayloadJWT, workspaceId: string, { limit, cursor }: GetQueryDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const activeStatuses: OrderStatus[] = [
            OrderStatus.PAID,
            OrderStatus.PENDING,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELLED // atau FAILED (sesuai Enum Anda)
        ];
        const take = limit ? limit : 20;
        const query: Prisma.OrderFindManyArgs = {
            where: {
                workspaceId,
                status: {
                    in: activeStatuses
                }
            },
            ...(cursor ? {
                cursor: { id: cursor },
                skip: 1
            } : {}),
            include: {
                items: true
            },
            take: take,
            orderBy: [
                { status: "asc" },
                { createdAt: "asc" }
            ]
        }
        const [orders, totalOrder] = await this.prisma.$transaction([
            this.prisma.order.findMany(query),
            this.prisma.order.count({
                where: query.where
            })
        ]);
        const nextId = orders.length >= take ? orders[orders.length - 1].id : null;
        const totalPage = Math.ceil(totalOrder / take);
        return {
            total: totalOrder,
            data: orders,
            nextId,
            totalPage
        }
    }

    async updateStatus(user: PayloadJWT, workspaceId: string, id: string, data: UpdateOrderStatusDto) {
        await this.workspaceService.validateRoleWorkspace(workspaceId, user.id);
        const existing = await this.prisma.order.findUnique({
            where: { id }
        });
        if (!existing) {
            throw new NotFoundException("Order not found");
        }
        const updateOrder = await this.prisma.order.update({
            where: { id },
            data: data
        });
        return {
            message: "Update status successfully",
            data: updateOrder
        };
    }
    async prosessingOrder(workspace: Workspace, data: OrderData) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [totalOrderThisMonth, totalOrderToday] = await this.prisma.$transaction([
            this.prisma.order.count({
                where: {
                    workspaceId: workspace.id,
                    createdAt: { gte: startOfMonth }
                }
            }),
            this.prisma.order.count({
                where: {
                    workspaceId: workspace.id,
                    createdAt: { gte: startOfDay }
                }
            }),
            ...(data.order?.map((ord) =>
                this.prisma.product.update({
                    where: { id: ord.id },
                    data: {
                        stock: { decrement: ord.quantity }
                    }
                })
            ) ?? [])
        ]);

        const year = String(now.getFullYear()).slice(-2);
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const nextNumber = String(totalOrderThisMonth + 1).padStart(4, '0');
        const orderNumber = `ORD-${year}${month}-${nextNumber}`;
        const order = await this.prisma.order.create({
            data: {
                workspaceId: workspace.id,
                orderNumber: orderNumber,
                grandTotal: data.total,
                paymentMethod: data.payment_method,
                notes: "",
                shortCode: `C-${totalOrderToday + 1}`,
                subtotal: data.total,
                shippingCost: data.shippingCost,
                details: {
                    ...data.detail,
                    delivery: data.delivery
                },
                items: {
                    createMany: {
                        data: data.order.map(ord => ({
                            price: ord.price,
                            quantity: ord.quantity,
                            subtotal: ord.price * ord.quantity,
                            productName: ord.product_name
                        }))
                    }
                }
            },
            include: {
                items: true
            }
        });
        return order;
    }
}
