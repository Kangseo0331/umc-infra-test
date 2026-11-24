// src/service/rating.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiException } from '../exception/api.exception';
import { Rating } from '../entity/rating.entity';
import { Member } from '../entity/member.entity';
import { RatingService } from './rating.service';

describe('RatingService', () => {
  let ratingService: RatingService;

  const ratingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const memberRepository = {
    findOneBy: jest.fn(),
  };

  const member = { memberId: 1, nickname: '영화조아' } as Member;

  const rating = {
    ratingId: 1,
    member,
    movieId: 550,
    score: 5,
    comment: '재밌는 영화!',
  } as Rating;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        { provide: getRepositoryToken(Rating), useValue: ratingRepository },
        { provide: getRepositoryToken(Member), useValue: memberRepository },
      ],
    }).compile();

    ratingService = module.get<RatingService>(RatingService);
  });

  it('이미 평점을 남긴 영화면 RATING409_1 예외를 던지고 저장하지 않는다', async () => {
    // given: 회원은 존재하고, 이미 해당 영화에 평점을 남긴 상황
    memberRepository.findOneBy.mockResolvedValue(member);
    ratingRepository.findOne.mockResolvedValue(rating);

    // when & then: 중복 등록 시 예외가 발생하고 저장은 시도하지 않는다
    await expect(
      ratingService.create(1, {
        movieId: 550,
        score: 5,
        comment: '재밌는 영화!',
      }),
    ).rejects.toThrow(ApiException);

    expect(ratingRepository.save).not.toHaveBeenCalled();
  });

  it('타인의 평점이면 RATING403_1 예외를 던진다', async () => {
    // given: 다른 회원이 작성한 평점
    ratingRepository.findOne.mockResolvedValue({
      ...rating,
      member: { memberId: 2 },
    });

    // when & then: 본인이 작성한 평점이 아니므로 예외가 발생한다
    await expect(
      ratingService.update(1, 1, {
        score: 4,
        comment: '수정한 후기',
      }),
    ).rejects.toThrow(ApiException);

    // 실제 저장은 수행되지 않았는지 확인
    expect(ratingRepository.save).not.toHaveBeenCalled();
  });
});