import { IsInt, IsOptional, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
    @ApiProperty({ description: '생성할 평점 ID', example: 1 })
    @IsInt({ message: '영화 ID는 정수여야 합니다. '})
    @Min(1, { message: '영화 ID는 양수여야 합니다. '})
    movieId: number;


    @ApiProperty({
        description: '생성할 1점 이상 5점 이하 평점',
        example: 5,
    })
    @IsInt({ message: '별점은 정수여야 합니다.' })
    @Min(1, { message: '별점은 1점 이상이어야 합니다.' })
    @Max(5, { message: '별점은 5점 이햐여야 합니다.' })
    score: number;

    @ApiProperty({ description: '생성할 후기', example: "재밌어요." })

    @IsOptional()
    @MaxLength(500, { message: '후기는 500자 이하로 입력해주세요.' })
    comment?: string;
}