import { PrismaClient } from "@prisma/client";


export async function createArticles() {
    const prisma = new PrismaClient();
    await prisma.articleTag.deleteMany();
    await prisma.article.deleteMany();
    await prisma.tag.deleteMany();

    // 2. Seed Data Tags
    const tagsData = [
        { name: 'NestJS', slug: 'nestjs' },
        { name: 'Redis', slug: 'redis' },
        { name: 'PostgreSQL', slug: 'postgresql' },
        { name: 'Prisma', slug: 'prisma' },
        { name: 'TypeScript', slug: 'typescript' },
    ];

    const createdTags = await Promise.all(
        tagsData.map((tag) =>
            prisma.tag.create({
                data: tag,
            }),
        ),
    );

    console.log(`✅ Created ${createdTags.length} tags.`);

    // Maps tag berdasarkan slug untuk kemudahan relasi
    const tagMap = new Map(createdTags.map((tag) => [tag.slug, tag.id]));
    const articlesData = [
        {
            title: 'Optimasi Cache NestJS Menggunakan Redis',
            slug: 'optimasi-cache-nestjs-menggunakan-redis',
            content:
                'Penggunaan Redis sebagai in-memory data store pada NestJS dapat meningkatkan performa respon API hingga berkali-kali lipat...',
            tagSlugs: ['nestjs', 'redis', 'typescript'],
        },
        {
            title: 'Panduan Lengkap Skema Relasi Prisma ORM',
            slug: 'panduan-lengkap-skema-relasi-prisma-orm',
            content:
                'Prisma mendukung relasi implicit dan explicit. Pada artikel ini kita akan membahas penanganan relasi Many-to-Many secara eksplisit...',
            tagSlugs: ['prisma', 'postgresql', 'typescript'],
        },
        {
            title: 'Manajemen Database PostgreSQL Versi Modern',
            slug: 'manajemen-database-postgresql-versi-modern',
            content:
                'PostgreSQL merupakan database relasional open-source dengan performa tinggi dan fitur penanganan JSON yang sangat fleksibel...',
            tagSlugs: ['postgresql'],
        },
    ];

    for (const articleItem of articlesData) {
        const { tagSlugs, ...articleInfo } = articleItem;

        await prisma.article.create({
            data: {
                ...articleInfo,
                tags: {
                    create: tagSlugs.map((slug) => ({
                        tag: {
                            connect: { id: tagMap.get(slug) },
                        },
                    })),
                },
            },
        });
    }

    console.log(`✅ Created ${articlesData.length} articles with tag relations.`);
    console.log('🚀 Seeding finished successfully!');
}