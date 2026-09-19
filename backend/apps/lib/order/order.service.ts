import { OrderData } from "@library/dto/order.dto";
import { PrismaService } from "@library/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Workspace } from "@prisma/client";



@Injectable()
export class OrderService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async prosessingOrder(workspaceId: string, orderId: string, data: OrderData) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const [totalOrderThisMonth, totalOrderToday] = await this.prisma.$transaction([
            this.prisma.order.count({
                where: {
                    workspaceId: workspaceId,
                    createdAt: { gte: startOfMonth }
                }
            }),
            this.prisma.order.count({
                where: {
                    workspaceId: workspaceId,
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
                id: orderId,
                workspaceId: workspaceId,
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