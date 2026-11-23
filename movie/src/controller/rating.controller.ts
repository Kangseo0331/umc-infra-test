import { Controller, Get, Delete, Post, Param, Body, HttpCode, HttpStatus, ParseIntPipe, Patch,Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from "supertest";
import { AuthGuard } from "../guard/auth.guard";

import { RatingService } from "../service/rating.service";
import { CreateRatingDto } from "../dto/create-rating.dto";
import { updateRatingDto } from "../dto/update-rating.dto";

@ApiTags('평점')
@Controller()
export class RatingController {
    constructor(
        private readonly ratingService: RatingService
    ) {}

    //평점 조회
    @ApiOperation({
        summary: '평점 조회',
        description: '매개변수로 받은 회원ID 주인의 TMDB 영화 평점 ID 목록을 조회합니다. 토큰이 필요하지 않습니다. ',
    })
    @ApiResponse({
        status: 200,
        description: '평점 목록 조회 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON200',
            message: '평점 목록을 조회했습니다.',
            result: {
                ratingId: 1,
                movieId: 1,
                score: 5,
                comment: "comment",
                createdAt: '2026-09-13T21:00:00.000Z',
                updatedAt: '2026-09-14T21:00:00.000Z',
            },
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: '존재하지 않는 회원',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER404_1',
            message: '해당 회원을 찾을 수 없습니다.',
            result: null,
        },
        },
    })
    @Get("members/:memberId/ratings")
    getRating(@Param("memberId") memberId: number){
        return this.ratingService.getRatingsByMember(memberId);
    }





    //평점 등록
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({
        summary: '평점 등록',
        description: '토큰의 주인인 회원이 TMDB 영화 ID 하나에 평점을 추가합니다. 토큰이 필요합니다.',
    })
    @ApiResponse({
        status: 201,
        description: '평점 등록 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON201',
            message: '평점 등록에 성공했습니다.',
            result: { 
                ratingId: 1,
                movieId: 1,
                score: 5,
                comment: "comment",
                createdAt: '2026-09-13T21:00:00.000Z',
                updatedAt: '2026-09-14T21:00:00.000Z',
            },
        },
        },
    })
    @ApiResponse({
        status: 401,
        description: '토큰이 없거나 유효하지 않음',
        schema: {
        example: {
            isSuccess: false,
            code: 'AUTH401_2',
            message: '로그인이 필요한 요청입니다.',
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 409,
        description: '이미 평점을 남긴 영화',
        schema: {
        example: {
            isSuccess: false,
            code: 'RATING409_1',
            message: '이미 이 영화에 평점을 남기셨습니다.',
            result: null,
        },
        },
    })
    @Post("ratings")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Req() request : Request & {memberId:number},
        @Body() dto: CreateRatingDto,
    ) {
        const memberId = request["memberId"];

        const ratingId = await this.ratingService.create(memberId, dto);
        return {
            isSuccess: true,
            code: "COMMON201",
            message: "평점 등록에 성공했습니다.",
            result: ratingId,
        };
    }




    //평점 수정
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({
        summary: '평점 수정',
        description: '토큰의 주인인 회원의 TMDB 영화 평점을 수정합니다. 토큰이 필요합니다.',
    })
    @ApiResponse({
        status: 201,
        description: '평점 수정 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON201',
            message: "평점 수정에 성공했습니다.",
            result: {
                ratingId: 1,
                movieId: 1,
                score: 5,
                comment: "comment",
                createdAt: '2026-09-13T21:00:00.000Z',
                updatedAt: '2026-09-14T21:00:00.000Z',
            },
        },
        },
    })
    @ApiResponse({
        status: 401,
        description: '토큰이 없거나 유효하지 않음',
        schema: {
        example: {
            isSuccess: false,
            code: 'AUTH401_2',
            message: '로그인이 필요한 요청입니다.',
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: '존재하지 않는 평점',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER404_1',
            message: '해당 평점을 찾을 수 없습니다.',
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 403,
        description: '권한 밖의 평점 수정',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER403_1',
            message: '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
            result: null,
        },
        },
    })
    @Patch("/ratings/:ratingId")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async update(
        @Req() request: Request & {memberId :number},
        @Param("ratingId", ParseIntPipe) ratingId: number,
        @Body() dto: updateRatingDto
    ) {
        const memberId = request['memberId'] as number;

        await this.ratingService.update(memberId, ratingId, dto);
        return {
            isSuccess: true,
            code: "COMMON201",
            message: "평점 수정에 성공했습니다.",
            result: null,
        };
    }



    //평점 삭제
    @ApiBearerAuth('bearerAuth')
    @ApiOperation({
        summary: '평점 삭제',
        description: '토큰의 주인인 회원의 TMDB 영화 평점을 삭제합니다. 토큰이 필요합니다.',
    })
    @ApiResponse({
        status: 204,
        description: '평점 삭제 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON204',
            message: "평점을 삭제했습니다.",
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 401,
        description: '토큰이 없거나 유효하지 않음',
        schema: {
        example: {
            isSuccess: false,
            code: 'AUTH401_2',
            message: '로그인이 필요한 요청입니다.',
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: '존재하지 않는 평점',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER404_1',
            message: '해당 평점을 찾을 수 없습니다.',
            result: null,
        },
        },
    })
    @ApiResponse({
        status: 403,
        description: '권한 밖의 평점 삭제',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER403_1',
            message: '본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.',
            result: null,
        },
        },
    })
    @Delete("/ratings/:ratingId")
    @UseGuards(AuthGuard)
    @HttpCode(HttpStatus.OK)
    async delete(
        @Req() request: Request & {memberId:number},
        @Param("ratingId", ParseIntPipe) ratingId: number,
    ) {
        const memberId = request["memberId"] as number
        await this.ratingService.delete(memberId, ratingId);

        return {
            isSuccess: true,
            code: 'COMMON200',
            message: '평점을 삭제했습니다.',
            result: null,
        };
    }

}