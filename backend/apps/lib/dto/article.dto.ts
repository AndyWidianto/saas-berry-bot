import { PartialType } from '@nestjs/swagger';
import { 
  IsArray, 
  IsBoolean, 
  IsDateString, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsUrl, 
  MaxLength 
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  slug?: string; // Jika kosong, backend bisa generate otomatis dari title

  @IsString()
  @IsNotEmpty()
  content: string;

  // SEO Fields
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160, { message: 'Meta description idealnya maksimal 160 karakter' })
  metaDescription?: string;

  @IsString()
  @IsOptional()
  keywords?: string;

  @IsUrl({}, { message: 'Featured image harus berupa URL valid' })
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  featuredImageAlt?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  authorName?: string; // Default: "Tim Redaksi" (diatur di Prisma/Backend)

  // Publishing & Indexing
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsDateString()
  @IsOptional()
  publishedAt?: string;

  @IsBoolean()
  @IsOptional()
  isIndexable?: boolean;

  // Relations (Array ID Tag yang dipilih)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];
}


export class UpdateArticleDto extends PartialType(CreateArticleDto) {}