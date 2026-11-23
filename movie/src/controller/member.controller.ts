import { Controller, Get, Post, Patch, HttpCode, HttpStatus, Param, Body, Req } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { MemberService } from "../service/member.service";
import { CreateMemberDto } from "../dto/create-member.dto";

import { AuthGuard } from "../guard/auth.guard";
import { UseGuards } from "@nestjs/common";
import { Request } from "@nestjs/common";
import { MemberUpdateRequestDto } from "../dto/member-update-request.dto";

@ApiTags('회원')
@Controller("members")
export class MemberController {
    constructor(private readonly memberService: MemberService) {}


    @Get("nickname/:nickname")
    checkNickname(@Param("nickname") nickname: string) {
        return this.memberService.checkNickname(nickname);
    }

    @Get("email/:email")
    checkEmail(@Param("email") email: string) {
        return this.memberService.checkEmail(email);
    }


    @ApiOperation({
        summary: '회원가입',
        description: '이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다.'
    })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() dto: CreateMemberDto) {
        const result = await this.memberService.signUp(dto);
        return {
            isSuccess: true,
            code: "COMMON201",
            message: "회원가입에 성공했습니다.",
            result,
        };
    }


    @ApiBearerAuth('bearerAuth')
    @ApiOperation({
        summary: '내 정보 조회',
        description: '내 이메일, 닉네임 정보를 조회합니다. 토큰이 필요합니다.'
    })
    @ApiResponse({
        status: 200,
        description: '내 정보 조회 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON200',
            result: {
                email: "a@umc.com",
                nickname: 'aaaa',
                createdAt: '2026-09-13T21:00:00.000Z',
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
    @Get('me')
    @UseGuards(AuthGuard)
    async getMyInfo(@Req() request: Request & { memberId: number }) {
        const memberId = request['memberId'] as number;
        const result = await this.memberService.getMyInfo(memberId);
        return { 
            isSuccess: true,
            code: 'COMMON200',
            result,
        }
    }



    @ApiBearerAuth('bearerAuth')
    @ApiOperation({
        summary: '내 정보 수정',
        description: '내 닉네임 정보를 수정합니다. 토큰이 필요합니다.',
    })
    @ApiResponse({
        status: 200,
        description: '회원 정보 수정 성공',
        schema: {
        example: {
            isSuccess: true,
            code: 'COMMON200',
            message: '회원 정보를 수정했습니다.',
            result: {
                email: "a@umc.com",
                nickname: 'aaaa',
                createdAt: '2026-09-13T21:00:00.000Z',
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
    @ApiResponse({
        status: 409,
        description: '이미 존재하는 닉네임',
        schema: {
        example: {
            isSuccess: false,
            code: 'MEMBER409_1',
            message: '이미 사용 중인 닉네임입니다.',
            result: null,
        },
        },
    })
    @Patch('me') 
    @UseGuards(AuthGuard)
    async updateMyInfo(
        @Req() request: Request & { memberId: number },
        @Body() dto: MemberUpdateRequestDto,
    ) {
        const memberId = request['memberId'] as number;
        const result = await this.memberService.updateMyInfo(memberId, dto)

        return {
            isSuccess: true,
            code: 'COMMON200',
            message: '회원 정보를 수정했습니다.',
            result,
        };
    }

}

