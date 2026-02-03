import { http, HttpResponse } from 'msw';

// Define the base URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// ----------------------------------------------------------------------
// Helpers & Mock Data Generators
// ----------------------------------------------------------------------

const generateList = <T>(count: number, generator: (index: number) => T): T[] =>
  Array.from({ length: count }, (_, i) => generator(i + 1));

const getRandomItem = <T>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

const TITLES = [
  '회귀했더니 천재 흑마법사',
  '전지적 독자 시점',
  '나 혼자만 레벨업',
  '화산귀환',
  '재벌집 막내아들',
  '전생검신',
  '템빨',
  '광마회귀',
  '데뷔 못 하면 죽는 병 걸림',
  '이번 생은 가주가 되겠습니다',
  '나를 죽여줘',
  '백작가의 망나니가 되었다',
  'SSS급 자살헌터',
  '전생했더니 슬라임이었던 건에 대하여',
  '소드마스터의 막내아들',
  '검술명가 막내아들',
  '닥터 최태수',
  '달빛조각사',
  '나노 마신',
  '마도전생기',
  '무한의 마법사',
  '빌런의 엔딩은 죽음뿐',
  '악녀는 마리오네트',
  '어느 날 공주가 되어버렸다',
  '재혼 황후',
  '황제의 외동딸',
  '황제의 외동딸',
  '픽 미 업',
  '디펜스 게임의 폭군이 되었다',
  '게임 속 바바리안으로 살아남기',
  '천재 타자의 강속구',
  '축구천재가 되다',
  '홈플레이트의 빌런',
  '탑 매니지먼트',
  '배우, 다시 서다',
  '천재 아이돌의 연예계 공략법',
];

const GENRES = [
  '판타지',
  '무협',
  '현대판타지',
  '로맨스판타지',
  'SF',
  '스포츠',
  '대체역사',
  '게임판타지',
  '미스터리',
  '스릴러',
  '라이트노벨',
];

const NAMES = [
  '김독자',
  '성진우',
  '청명',
  '진도준',
  '그리드',
  '이자하',
  '박문대',
  '피렌티아',
  '케일 헤니투스',
  '김공자',
  '리무루',
  '진 룬칸델',
  '최태수',
  '이현',
  '천여운',
  '천하진',
  '시로네',
  '페넬로페',
  '카예나',
  '아타나시아',
  '나비에',
  '아리아드나',
  '로키',
  '애쉬',
  '비요른',
  '강건우',
  '이현우',
  '정윤호',
  '서준',
  '강우진',
  '온하준',
  '유중혁',
  '한수영',
  '차해인',
  '백윤호',
  '당보',
  '장일소',
  '이성민',
  '위드',
  '서윤',
];

const MOCK_PROPOSALS = generateList(10, (i) => ({
  id: i,
  title: `${getRandomItem(TITLES)} 웹툰화 제안`,
  status: getRandomItem(['PENDING', 'REVIEWING', 'APPROVED']),
  statusDescription: '검토 중입니다.',
  createdAt: new Date().toISOString(),
}));

// ----------------------------------------------------------------------
// Stateful Mock Data
// ----------------------------------------------------------------------

let MOCK_WORKS = generateList(5, (i) => ({
  id: i,
  title: TITLES[i % TITLES.length],
  description: '이 작품은...',
  status: (i === 0
    ? 'NEW'
    : i % 3 === 0
      ? 'NEW'
      : i % 3 === 1
        ? 'ONGOING'
        : 'COMPLETED') as
    | 'NEW'
    | 'ONGOING'
    | 'COMPLETED'
    | 'HIATUS'
    | 'DROPPED',
  synopsis: '시놉시스 내용입니다.',
  genre: GENRES[i % GENRES.length],
  coverImageUrl: `https://via.placeholder.com/300?text=Work+${i}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  writer: 'Author',
  statusDescription: '상태 설명',
}));

// Map<WorkId, Manuscript[]>
const MOCK_MANUSCRIPTS = new Map<number, any[]>();

// Initialize manuscripts for existing works (except NEW ones)
MOCK_WORKS.forEach((work) => {
  if (work.status !== 'NEW') {
    MOCK_MANUSCRIPTS.set(
      work.id,
      generateList(3, (i) => ({
        id: i,
        workId: work.id,
        episode: i + 1,
        subtitle: `제 ${i + 1}화 - 내용`,
        createdAt: new Date().toISOString(),
        txt: `내용입니다...`,
      })),
    );
  } else {
    MOCK_MANUSCRIPTS.set(work.id, []);
  }
});

// ----------------------------------------------------------------------
// Handlers Definition
// ----------------------------------------------------------------------

export const handlers = [
  // ======================================================================
  // 1. Test API
  // ======================================================================
  http.get(
    `${BACKEND_URL}/api/v1/hello`,
    () =>
      new HttpResponse('helloUser AIVLE SCHOOL 8th', {
        headers: { 'Content-Type': 'text/plain' },
      }),
  ),
  http.get(
    `${BACKEND_URL}/api/v1/auth/naver/hello`,
    () =>
      new HttpResponse('naverhelloUser AIVLE SCHOOL 8th', {
        headers: { 'Content-Type': 'text/plain' },
      }),
  ),
  http.get(`${BACKEND_URL}/api/v1/api/test`, () =>
    HttpResponse.json(
      generateList(30, (i) => ({
        id: i,
        name: `테스트 데이터 ${i}`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      })),
    ),
  ),

  // ======================================================================
  // 2. User API (Auth & Signup)
  // ======================================================================
  http.get(`${BACKEND_URL}/api/v1/auth/me`, () => {
    const storedRole = localStorage.getItem('msw-session-role');
    if (storedRole) {
      return HttpResponse.json({
        type: 'AUTH',
        role: storedRole,
        userId: 1,
        email: 'user@example.com',
        name: '김에이블',
        siteEmail: 'user@example.com',
        mobile: '010-1234-5678',
        birthYear: '1995',
        gender: 'M',
        createdAt: '2025-01-01T09:00:00',
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post(`${BACKEND_URL}/api/v1/auth/login`, async ({ request }) => {
    const info = (await request.json()) as any;
    let role = 'Author';
    if (info.siteEmail?.includes('admin')) role = 'Admin';
    else if (info.siteEmail?.includes('manager')) role = 'Manager';

    localStorage.setItem('msw-session-role', role);
    return HttpResponse.json({ success: true, role, type: 'AUTH' });
  }),

  http.post(`${BACKEND_URL}/api/v1/auth/logout`, () => {
    localStorage.removeItem('msw-session-role');
    return HttpResponse.json({ success: true });
  }),

  http.post(`${BACKEND_URL}/api/v1/auth/password/reset`, async () => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset successful',
    });
  }),

  http.get(`${BACKEND_URL}/api/v1/auth/naver/login`, () =>
    HttpResponse.json({
      url: 'https://nid.naver.com/oauth2.0/authorize?mock=true',
      message: 'Naver Login URL generated (Mocked)',
    }),
  ),

  // ======================================================================
  // 3. Admin API
  // ======================================================================

  // 3.1 Dashboard
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/summary`, () =>
    HttpResponse.json({
      totalUsers: 1250,
      activeUsers: 850,
      totalSales: 15000000,
      serverStatus: 'NORMAL',
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/dau`, () =>
    HttpResponse.json({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ label: 'DAU', data: [120, 190, 300, 250, 200, 350, 400] }],
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/resources`, () =>
    HttpResponse.json({ cpu: 45, memory: 60, disk: 30 }),
  ),
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/logs`, () =>
    HttpResponse.json({
      logs: generateList(20, (i) => ({
        id: i,
        level: i % 10 === 0 ? 'ERROR' : 'INFO',
        message: `System Log ${i}: ${i % 10 === 0 ? 'Critical Failure' : 'Normal Operation'}`,
        timestamp: new Date().toISOString(),
        service: 'AuthService',
      })),
    }),
  ),

  // 3.2 Access
  http.get(`${BACKEND_URL}/api/v1/admin/access/summary`, () =>
    HttpResponse.json({
      adminCount: 5,
      managerCount: 12,
      authorCount: 1232,
      deactivatedCount: 45,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/admin/access/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const total = 120;

    return HttpResponse.json({
      content: generateList(size, (i) => {
        const role = getRandomItem([
          'Author',
          'Manager',
          'Admin',
          'DEACTIVATED',
        ]);
        return {
          id: page * size + i,
          email: `user${page * size + i}@test.com`,
          name: `User ${page * size + i}`,
          role: role,
          status: role === 'DEACTIVATED' ? 'INACTIVE' : 'ACTIVE',
          lastLoginAt: new Date().toISOString(),
          lastAt:
            role === 'DEACTIVATED'
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
          createdAt: new Date().toISOString(),
        };
      }),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  }),

  // 3.3 Notice
  http.get(`${BACKEND_URL}/api/v1/notice`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const keyword = url.searchParams.get('keyword') || '';

    const content = generateList(size, (i) => {
      const id = page * size + i;
      const titleBase = `[공지] 시스템 점검 안내 ${id}`;
      const title =
        keyword && !titleBase.includes(keyword)
          ? `${titleBase} (${keyword})`
          : titleBase;
      return {
        id,
        title,
        content:
          '시스템 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
        originalFilename: i % 3 === 0 ? `notice_${id}.pdf` : null,
        writer: 'Admin',
        createdAt: new Date(Date.now() - id * 86400000).toISOString(),
      };
    });

    return HttpResponse.json({
      content,
      totalElements: 50,
      totalPages: 5,
      number: page,
    });
  }),

  // ======================================================================
  // 4. Manager API
  // ======================================================================

  // 4.0 Author Dashboard (Added for Error Fix)
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/summary`, () =>
    HttpResponse.json({
      totalWorks: 5,
      completedWorks: 2,
      totalViews: 12500,
      monthlyIncome: 3500000,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/notice`, () =>
    HttpResponse.json(
      generateList(5, (i) => ({
        id: i,
        title: `[공지] 작가님들을 위한 ${i}월 가이드`,
        createdAt: '2026-02-01',
      })),
    ),
  ),

  // 4.1 Dashboard
  http.get(`${BACKEND_URL}/api/v1/manager/dashboard/summary`, () =>
    HttpResponse.json({
      pendingProposals: 15,
      activeContests: 3,
      managedAuthors: 45,
      monthlyPerformance: 98.5,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/manager/dashboard/notice`, () =>
    HttpResponse.json(
      generateList(5, (i) => ({
        id: i,
        title: `[운영] ${i}월 운영 가이드라인`,
        createdAt: '2026-01-25',
      })),
    ),
  ),

  // 4.2 IP Expansion
  http.get(`${BACKEND_URL}/api/v1/manager/ipext`, () =>
    HttpResponse.json({
      content: generateList(10, (i) => ({
        id: i,
        title: `${getRandomItem(TITLES)} 웹툰화 제안`,
        authorName: getRandomItem(NAMES),
        category: '웹툰',
        status: getRandomItem(['PENDING', 'REVIEWING', 'APPROVED']),
        submittedAt: new Date().toISOString(),
      })),
      totalPages: 5,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/manager/ipext/proposals/:id`, ({ params }) =>
    HttpResponse.json({
      id: params.id,
      title: `${getRandomItem(TITLES)} IP 확장 제안서`,
      authorName: getRandomItem(NAMES),
      category: '웹툰',
      status: 'REVIEWING',
      content: '이 작품은 독창적인 세계관을 바탕으로...',
      aiGuideline: '주인공의 성격을 좀 더 부각시키는 방향으로...',
    }),
  ),

  // 4.3 Assets
  http.get(`${BACKEND_URL}/api/v1/manager/assets`, () =>
    HttpResponse.json({
      content: generateList(12, (i) => ({
        id: i,
        title: `판타지 마을 배경 ${i}`,
        type: '3D Model',
        category: 'Fantasy',
        status: 'APPROVED',
        thumbnailUrl: 'https://via.placeholder.com/150',
      })),
      totalPages: 3,
    }),
  ),

  // 4.4 Analyze
  http.get(`${BACKEND_URL}/api/v1/manager/analyze/analysis`, () =>
    HttpResponse.json({
      content: generateList(10, (i) => ({
        id: i,
        workTitle: getRandomItem(TITLES),
        authorName: getRandomItem(NAMES),
        analyzedAt: new Date().toISOString(),
        score: 85 + (i % 15),
      })),
      totalPages: 4,
    }),
  ),

  // 4.5 Trends & Contest & Authors
  http.get(`${BACKEND_URL}/api/v1/manager/iptrend`, () =>
    HttpResponse.json({
      latestReport: {
        id: 100,
        fileName: '2025-02-02_IP_Trend_Analysis.pdf',
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
        fileSize: 102400,
      },
      statistics: {
        totalReports: 25,
        completedReports: 20,
        failedReports: 5,
        lastGeneratedAt: new Date().toISOString(),
        // Extra fields for compatibility if needed
        monthlyGrowth: 15.2,
        topFormat: '웹툰',
      },
      recentReports: generateList(5, (i) => ({
        id: i,
        fileName: `Report_${i}.pdf`,
        createdAt: new Date().toISOString(),
        status: 'COMPLETED',
      })),
      trends: generateList(12, (i) => ({
        month: `${i + 1}월`,
        count: 10 + Math.floor(Math.random() * 20),
      })),
      summary: {
        currentMonthCount: 1,
        totalCount: 24,
        lastUpdate: '2025-01-15',
        topKeywords: ['회빙환', 'OSMU'],
      },
    }),
  ),

  // 4.6 AI Analysis (Author)
  http.post(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/upload`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({ success: true });
    },
  ),

  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/:id`,
    ({ params }) => {
      return HttpResponse.json({
        id: Number(params.id),
        episode: 1,
        subtitle: '프롤로그',
        txt: '원문 내용 텍스트...',
        createdAt: new Date().toISOString(),
      });
    },
  ),

  http.delete(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/:id`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return HttpResponse.json({ success: true });
    },
  ),

  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook`,
    ({ request }) => {
      const url = new URL(request.url);
      const workId = url.searchParams.get('workId');
      return HttpResponse.json(
        generateList(20, (i) => ({
          id: i,
          workId: Number(workId),
          name: `설정 ${i}`,
          category: getRandomItem([
            'characters',
            'places',
            'items',
            'groups',
            'worldviews',
            'plots',
          ]),
          description: '설정 설명...',
          image: null,
        })),
      );
    },
  ),

  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category`,
    ({ params, request }) => {
      const category = params.category as string;
      const url = new URL(request.url);
      const workId = url.searchParams.get('workId');
      
      // Map Korean category names to English if needed, or use as is
      // The user provided example uses Korean '인물'
      return HttpResponse.json(
        generateList(5, (i) => ({
          id: i,
          workId: Number(workId),
          name: `${category} 설정 ${i}`,
          category: category,
          description: `${category}에 대한 상세 설정입니다.`,
          image: null,
        })),
      );
    },
  ),

  http.delete(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category/:id`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return HttpResponse.json({ success: true });
    },
  ),

  http.post(
    `${BACKEND_URL}/api/v1/ai/author/:userId/:title/manuscript/setting`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return HttpResponse.json({
        check: ['키워드1', '키워드2'],
        setting_book: '설정집 내용...',
        diff: '변경점...',
      });
    },
  ),

  http.post(
    `${BACKEND_URL}/api/v1/ai/author/:userId/:title/lorebook/conflict_solve`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return HttpResponse.json({
        solution: '충돌 해결 방안...',
      });
    },
  ),

  http.post(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/categories`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        인물: [
          '가렌',
          '럭스',
          '피테르',
          '티아나',
          '자르반 3세',
          '자르반 4세',
          '숙부',
          '마법사',
          '광신자',
          '용맹한 수호자',
        ],
        세계: ['룬 전쟁', '데마시아 왕국', '데마시아 이념', '마법', '심연'],
        장소: [
          '크라운가드 저택',
          '하이 실버미어',
          '데마시아',
          '프렐요드 국경',
          '침묵의 숲',
          '화이트록',
          '용기의 전당',
          '빛의 사자 수도회',
        ],
        사건: [
          '가렌의 군 입대',
          '숙부의 죽음',
          '프렐요드 국경 출정',
          '부패한 광신자 축출',
          '불굴의 선봉대 선발 시험',
          '가렌의 검대장 임명',
          '럭스의 마법 기운 발견',
        ],
        물건: ['데마시아산 강철', '무기'],
        집단: [
          '크라운가드 가문',
          '데마시아군',
          '기동대 기사',
          '방벽 부대',
          '불굴의 선봉대',
          '평민',
          '궁정인',
          '빛의 사자 수도회',
        ],
      });
    },
  ),

  // Manager Lorebooks
  http.get(
    `${BACKEND_URL}/api/v1/manager/works/:workId/lorebooks`,
    ({ params }) => {
      const workId = Number(params.workId);
      return HttpResponse.json(
        generateList(15, (i) => ({
          id: workId * 100 + i,
          keyword: `${TITLES[(workId + i) % TITLES.length]} 설정`,
          category: getRandomItem([
            '인물',
            '세계',
            '장소',
            '사건',
            '물건',
            '집단',
          ]),
          updatedAt: new Date().toISOString(),
        })),
      );
    },
  ),

  // Manager IP Expansion Creation
  http.post(
    `${BACKEND_URL}/api/v1/manager/ip-expansion/proposals`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return HttpResponse.json({
        success: true,
        id: Math.floor(Math.random() * 1000),
      });
    },
  ),

  http.get(`${BACKEND_URL}/api/v1/manager/ip-expansion/proposals`, () =>
    HttpResponse.json(
      generateList(14, (i) => {
        const id = i;
        const authorIndex = id % NAMES.length;
        const workIndex = id % TITLES.length;
        const formats = [
          'webtoon',
          'game',
          'drama',
          'movie',
          'animation',
          'goods',
          'publication',
        ];
        const format = formats[i % formats.length];
        const formatNames: Record<string, string> = {
          webtoon: '웹툰',
          game: '게임',
          drama: '드라마',
          movie: '영화',
          animation: '애니메이션',
          goods: '굿즈',
          publication: '출판',
        };

        return {
          id: i,
          title: `${TITLES[workIndex]} ${formatNames[format]}화 제안`,
          status: getRandomItem([
            'PENDING',
            'REVIEWING',
            'APPROVED',
            'PROPOSED',
          ]),
          statusDescription: '검토 중입니다.',
          createdAt: new Date().toISOString(),
          authorId: authorIndex,
          authorName: NAMES[authorIndex],
          workId: workIndex,
          workTitle: TITLES[workIndex],
          content: '이 작품은 독창적인 세계관을 바탕으로...',
          format: format,
          strategy: {
            genre: 'original',
            targetGenre: '판타지',
            universe: 'shared',
          },
          business: {
            targetAge: ['20s', '30s'],
            targetGender: 'all',
            budgetRange: 'medium',
            toneManner: '진지한, 웅장한',
          },
          mediaDetails: {
            style: format === 'webtoon' ? 'casual' : 'realistic',
            seasonType: 'series',
            episodes: 12,
          },
          contentStrategy: {
            coreNarrative: '주인공의 성장을 중심으로 한 영웅 서사',
            characterArc: '평범한 소년에서 영웅으로 거듭나는 과정',
            worldBuilding: '마법과 기술이 공존하는 독창적인 세계관',
            themeMessage: '희망과 용기',
            visualStyle: '화려한 액션과 섬세한 감정 묘사',
            differentiation: '독특한 마법 시스템과 매력적인 조연들',
          },
          lorebooks: [
            {
              id: 1,
              keyword: '주인공 설정',
              authorName: NAMES[authorIndex],
              workTitle: TITLES[workIndex],
              category: '인물',
            },
            {
              id: 2,
              keyword: '세계관 설정',
              authorName: NAMES[authorIndex],
              workTitle: TITLES[workIndex],
              category: '세계',
            },
          ],
        };
      }),
    ),
  ),

  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/list`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const total = 60;

    return HttpResponse.json({
      content: generateList(size, (i) => ({
        id: page * size + i,
        fileName: `2025-${((page * size + i) % 12) + 1}-01_IP_Trend_Analysis_${page * size + i}.pdf`,
        createdAt: new Date(
          Date.now() - (page * size + i) * 86400000 * 30,
        ).toISOString(),
        status: i % 5 === 0 ? 'FAILED' : 'COMPLETED',
        summary: '판타지 장르의 웹툰화 전환율 상승에 따른 IP 확장 전략 제언',
      })),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  }),

  http.get(
    `${BACKEND_URL}/api/v1/manager/iptrend/preview/:id`,
    ({ params }) => {
      return HttpResponse.json({
        id: Number(params.id),
        title: 'IP 트렌드 분석 리포트',
        analysisDate: '2025-01-15',
        content: '<p>분석 내용입니다...</p>',
        pdfUrl: 'https://example.com/report.pdf',
      });
    },
  ),

  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/exists-today`, () =>
    HttpResponse.json(false),
  ),

  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/genre`, () =>
    HttpResponse.json([
      { genre: '판타지', growth: 12.5 },
      { genre: '로맨스판타지', growth: 8.2 },
      { genre: '무협', growth: -2.1 },
    ]),
  ),

  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/report`, () => {
    // Minimal valid PDF (Hello World)
    const pdfBase64 =
      'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgcGFnZXMKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlIHBhZ2UgMQo8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUgogIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9GMSA0IDAgUgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmogICUgZm9udAo8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmogICUgcGFnZSBjb250ZW50Cjw8CiAgL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKNzAgNTAgVGQKL0YxIDEyIFRmCihIZWxsbywgd29ybGQhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTU3IDAwMDAwIG4gCjAwMDAwMDAyNTUgMDAwMDAgbiAKMDAwMDAwMDM0NCAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTMKJSVFT0YK';

    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([bytes], { type: 'application/pdf' });
    return new HttpResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="latest_report.pdf"',
      },
    });
  }),

  http.get(
    `${BACKEND_URL}/api/v1/manager/iptrend/download/:id`,
    ({ params }) => {
      const id = params.id;
      // Minimal valid PDF (Hello World)
      const pdfBase64 =
        'JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUgcGFnZXMKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlIHBhZ2UgMQo8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUgogIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9GMSA0IDAgUgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmogICUgZm9udAo8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9UaW1lcy1Sb21hbgo+PgplbmRvYmoKCjUgMCBvYmogICUgcGFnZSBjb250ZW50Cjw8CiAgL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKNzAgNTAgVGQKL0YxIDEyIFRmCihIZWxsbywgd29ybGQhKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCgp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTAgMDAwMDAgbiAKMDAwMDAwMDA2MCAwMDAwMCBuIAowMDAwMDAwMTU3IDAwMDAwIG4gCjAwMDAwMDAyNTUgMDAwMDAgbiAKMDAwMDAwMDM0NCAwMDAwMCBuIAp0cmFpbGVyCjw8CiAgL1NpemUgNgogIC9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTMKJSVFT0YK';

      const binaryString = atob(pdfBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: 'application/pdf',
      });
      return new HttpResponse(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report_${id}.pdf"`,
        },
      });
    },
  ),

  http.post(`${BACKEND_URL}/api/v1/manager/iptrend/generate`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({
      success: true,
      message: 'Report generation started',
    });
  }),

  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/scheduler/run`, () => {
    return HttpResponse.json({ success: true, message: 'Scheduler triggered' });
  }),

  // Manager Author Management
  http.get(`${BACKEND_URL}/api/v1/manager/authors/summary`, () =>
    HttpResponse.json({
      totalAuthors: 1234,
      newAuthors: 15,
      activeAuthors: 980,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/manager/authors/list`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const total = 120;

    return HttpResponse.json({
      content: generateList(size, (i) => ({
        id: page * size + i,
        name: NAMES[(page * size + i) % NAMES.length],
        email: `author${page * size + i}@example.com`,
        workCount: 3 + (i % 5),
        createdAt: new Date(Date.now() - i * 86400000 * 30).toISOString(),
        status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
      })),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  }),
  http.get(`${BACKEND_URL}/api/v1/manager/authors`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const total = 150;

    return HttpResponse.json({
      content: generateList(size, (i) => {
        const id = page * size + i;
        return {
          id: id,
          name: NAMES[id % NAMES.length],
          email: `author${id}@example.com`,
          workCount: 3 + (id % 5),
          createdAt: new Date(Date.now() - id * 86400000 * 30).toISOString(),
          status: id % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
          recentWorks: generateList(3, (j) => ({
            id: j,
            title: TITLES[(id + j) % TITLES.length],
            createdAt: new Date(Date.now() - j * 86400000).toISOString(),
          })),
          lastLogin: new Date().toISOString(),
        };
      }),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    });
  }),
  http.get(`${BACKEND_URL}/api/v1/manager/authors/:id`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      id,
      name: NAMES[id % NAMES.length],
      email: `author${id}@example.com`,
      workCount: 3 + (id % 5),
      createdAt: new Date(Date.now() - id * 86400000 * 30).toISOString(),
      status: id % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
      recentWorks: generateList(3, (j) => ({
        id: j,
        title: TITLES[(id + j) % TITLES.length],
        createdAt: new Date(Date.now() - j * 86400000).toISOString(),
      })),
      lastLogin: new Date().toISOString(),
    });
  }),
  // Linked authors for Manager
  http.get(`${BACKEND_URL}/api/v1/manager/authors/linked`, () =>
    HttpResponse.json(
      generateList(6, (i) => ({
        id: i,
        name: NAMES[i % NAMES.length],
      })),
    ),
  ),
  // Works for a specific author (Manager view)
  http.get(`${BACKEND_URL}/api/v1/manager/authors/:id/works`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json(
      generateList(8, (i) => ({
        id: id * 100 + i,
        title: `${TITLES[(id + i) % TITLES.length]}`,
      })),
    );
  }),

  http.post(`${BACKEND_URL}/api/v1/manager/authors/:pwd`, ({ params }) => {
    const pwd = String(params.pwd);
    // Mock logic: accept any 6-digit code or legacy AUTH- code
    if ((pwd.length === 6 && /^\d+$/.test(pwd)) || pwd.startsWith('AUTH-')) {
      return HttpResponse.json({
        authorId: 123,
        name: '김작가',
      });
    }
    // Otherwise return 404 or 400
    return new HttpResponse(null, { status: 404 });
  }),

  // ======================================================================
  // 5. Author API
  // ======================================================================

  // 5.0 Manager & Invite Code
  http.get(`${BACKEND_URL}/api/v1/author/manager`, () => {
    // Mock: 50% chance of being matched
    // You can toggle this logic or inspect localStorage to simulate states
    const isMatched = Math.random() > 0.5;

    if (isMatched) {
      return HttpResponse.json({
        ok: true,
        managerIntegrationId: 'admin',
        managerName: '김운영',
        managerSiteEmail: 'manager@test.com',
      });
    } else {
      return HttpResponse.json({
        ok: false,
        managerIntegrationId: null,
        managerName: null,
        managerSiteEmail: null,
      });
    }
  }),

  http.post(`${BACKEND_URL}/api/v1/author/manager/code`, () => {
    // Return 6-digit code as Map<String, Object>
    return HttpResponse.json({
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiresIn: 300,
    });
  }),

  // 5.1 Works
  http.get(`${BACKEND_URL}/api/v1/author/works`, () =>
    HttpResponse.json(MOCK_WORKS),
  ),

  http.get(`${BACKEND_URL}/api/v1/author/works/:workId`, ({ params }) => {
    const id = Number(params.workId);
    const work = MOCK_WORKS.find((w) => w.id === id);
    if (!work) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(work);
  }),

  http.post(`${BACKEND_URL}/api/v1/author/works`, async ({ request }) => {
    const body = (await request.json()) as any;
    const newId = Math.max(...MOCK_WORKS.map((w) => w.id), 0) + 1;
    const newWork = {
      id: newId,
      title: body.title,
      description: body.description,
      status: 'NEW' as const,
      statusDescription: '신규 생성됨',
      synopsis: body.synopsis || '',
      genre: body.genre || '판타지',
      coverImageUrl:
        body.coverImageUrl ||
        `https://via.placeholder.com/300?text=Work+${newId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      writer: 'Author',
    };
    MOCK_WORKS.push(newWork);
    MOCK_MANUSCRIPTS.set(newId, []);
    return HttpResponse.json(newId);
  }),

  http.patch(`${BACKEND_URL}/api/v1/author/works`, async ({ request }) => {
    const body = (await request.json()) as any;
    const index = MOCK_WORKS.findIndex((w) => w.id === body.id);
    if (index !== -1) {
      MOCK_WORKS[index] = {
        ...MOCK_WORKS[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return HttpResponse.json(MOCK_WORKS[index].id);
    }
    return new HttpResponse(null, { status: 404 });
  }),

  http.patch(
    `${BACKEND_URL}/api/v1/author/works/:workId/status`,
    ({ params, request }) => {
      const id = Number(params.workId);
      const url = new URL(request.url);
      const status = url.searchParams.get('status');
      const index = MOCK_WORKS.findIndex((w) => w.id === id);
      if (index !== -1 && status) {
        MOCK_WORKS[index].status = status as any;
        MOCK_WORKS[index].updatedAt = new Date().toISOString();
        return HttpResponse.json({ success: true });
      }
      return new HttpResponse(null, { status: 404 });
    },
  ),

  http.delete(`${BACKEND_URL}/api/v1/author/works/:workId`, ({ params }) => {
    return new HttpResponse(null, { status: 200 });
  }),

  // 5.2 Episodes (Removed - replaced by Manuscripts)

  // 5.3 Lorebooks (Settings)
  http.get(`${BACKEND_URL}/api/v1/author/lorebook`, () =>
    HttpResponse.json(
      generateList(5, (i) => ({
        id: i,
        title: `설정집 ${i}`,
        description: '설정집 설명',
        updatedAt: new Date().toISOString(),
      })),
    ),
  ),

  // Lorebook Category List (Unified Handler)
  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category`,
    ({ params }) => {
      const { category } = params;
      const generateLorebookList = (count: number) => {
        return Array.from({ length: count }).map((_, i) => {
          let settingContent: any = { description: 'Default description' };
          let keyword = `Entry ${i}`;

          switch (category) {
            case 'characters':
              keyword = `Character ${i}`;
              settingContent = {
                description: 'A brave hero.',
                role: 'Protagonist',
                age: '20',
                traits: ['Brave', 'Strong'],
              };
              break;
            case 'places':
              keyword = `Place ${i}`;
              settingContent = {
                description: 'A dark dungeon.',
                location: 'North',
              };
              break;
            case 'items':
              keyword = `Item ${i}`;
              settingContent = {
                description: 'A legendary sword.',
                type: 'Weapon',
                grade: 'S',
              };
              break;
            case 'groups':
              keyword = `Group ${i}`;
              settingContent = {
                description: 'A powerful guild.',
                leader: 'Leader Name',
              };
              break;
            case 'worldviews':
              keyword = `Worldview ${i}`;
              settingContent = {
                description: 'A magical world.',
                tags: ['Fantasy', 'Magic'],
              };
              break;
            case 'plots':
              keyword = `Plot ${i}`;
              settingContent = {
                description: 'The war begins.',
                order: i,
              };
              break;
          }

          return {
            id: i,
            userId: params.userId,
            workId: 1, // Mock workId
            category: category,
            keyword: keyword,
            setting: JSON.stringify(settingContent),
            epNum: [],
          };
        });
      };

      return HttpResponse.json(generateLorebookList(5));
    },
  ),

  // Lorebook Search
  http.get(`${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/search`, () =>
    HttpResponse.json(
      Array.from({ length: 3 }).map((_, i) => ({
        id: i,
        userId: 'user1',
        workId: 1,
        category: 'characters',
        keyword: `Search Result ${i}`,
        setting: JSON.stringify({
          description: 'Search result description.',
        }),
        epNum: [],
      })),
    ),
  ),

  // 5.4 Publish Confirm
  http.post(
    `${BACKEND_URL}/api/v1/author/works/:workId/publish/confirm`,
    () => {
      return HttpResponse.json({ success: true });
    },
  ),

  // 5.5 Serialization & AI Analysis (Replaces AI Server Calls)
  // Old episode endpoint removed

  // New Endpoint: Keyword Extraction
  http.post(`${BACKEND_URL}/api/v1/ai/author/categories`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return HttpResponse.json({
      check: {
        인물: ['강민우', '이수연', '김철수'],
        세계: ['마나', '헌터 시스템'],
        장소: ['아카데미 기숙사', '서울 타워', '지하 벙커'],
        사건: ['게이트 발생', '화룡의 둥지 공략'],
        물건: ['엑스칼리버'],
        집단: ['피닉스 길드', '헌터 협회'],
      },
    });
  }),

  // New Endpoint: Novel Analysis (Final Review)
  http.post(`${BACKEND_URL}/api/v1/ai/author/setting`, async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock Data for Final Review Modal
    const response = {
      충돌: [
        {
          id: 'conf-1',
          category: '인물',
          name: '강민우',
          reason: '성격 묘사 충돌',
          original:
            '냉철하고 계산적인 성격. 이익을 위해서라면 동료도 이용할 수 있다. 항상 포커페이스를 유지하며 감정을 드러내지 않는다.',
          new: '다혈질이고 정의로운 성격. 불의를 보면 참지 못하고 나선다. 동료를 끔찍이 아끼며 감정 표현이 솔직하다.',
        },
        {
          id: 'conf-2',
          category: '설정',
          name: '마나 운영법',
          reason: '설정 모순 발생',
          original:
            '마나는 심장에서 생성되어 전신으로 퍼진다. 심장이 파괴되면 마나를 사용할 수 없다.',
          new: '마나는 대기 중에 존재하며, 호흡을 통해 단전으로 축적된다. 신체 내부에서 생성되지 않는다.',
        },
        {
          id: 'conf-3',
          category: '장소',
          name: '아카데미 기숙사',
          reason: '위치 정보 불일치',
          original: '아카데미 본관 북쪽에 위치하며, 숲과 인접해 있어 조용하다.',
          new: '아카데미 본관 남쪽 번화가 근처에 위치하며, 항상 시끌벅적하다.',
        },
      ],
      '설정 결합': [
        {
          id: 'upd-1',
          category: '장소',
          name: '서울 타워',
          original: JSON.stringify(
            {
              description:
                '서울의 랜드마크이자 헌터 협회의 본거지. 높이 555m의 마천루로, 최상층에는 협회장실이 위치해 있다.',
              features: ['헌터 협회 본부', '결계 보호', '높이 555m'],
              status: 'SAFE',
            },
            null,
            2,
          ),
          new: JSON.stringify(
            {
              description:
                '서울의 랜드마크이자 헌터 협회의 본거지. 높이 555m의 마천루. 최근 몬스터 습격으로 인해 외벽 일부가 파손되었으나, 여전히 굳건하게 자리를 지키고 있다.',
              features: [
                '헌터 협회 본부',
                '결계 보호',
                '높이 555m',
                '외벽 파손',
                '보안 강화',
              ],
              status: 'DAMAGED',
            },
            null,
            2,
          ),
        },
        {
          id: 'upd-2',
          category: '인물',
          name: '이수연',
          original: JSON.stringify(
            {
              role: '히로인',
              ability: '화염 마법 (A급)',
              affiliation: '피닉스 길드',
            },
            null,
            2,
          ),
          new: JSON.stringify(
            {
              role: '히로인',
              ability: '화염 마법 (S급으로 성장)',
              affiliation: '피닉스 길드 (부길드장 승진)',
              recent_event: '화룡의 둥지 공략 성공',
            },
            null,
            2,
          ),
        },
      ],
      '신규 업로드': [
        {
          id: 'new-1',
          category: '물건',
          name: '엑스칼리버',
          description:
            '전설 속의 성검. 빛 속성 마력을 증폭시키는 효과가 있다. 자격이 있는 자만이 뽑을 수 있다고 전해진다.',
        },
        {
          id: 'new-2',
          category: '장소',
          name: '지하 벙커',
          description:
            '전쟁 대비용으로 지어진 비밀 벙커. 현재는 주인공 일행의 아지트로 사용되고 있다.',
        },
        {
          id: 'new-3',
          category: '사건',
          name: '게이트 발생',
          description:
            '서울 한복판에 S급 게이트가 발생하여 비상 사태가 선포되었다.',
        },
        {
          id: 'new-4',
          category: '인물',
          name: '김철수',
          description:
            '주인공의 어릴 적 친구이자 라이벌. 검술에 뛰어난 재능을 보인다.',
        },
      ],
    };

    return HttpResponse.json(response);
  }),

  // Publish Analysis (Save Settings)
  http.post(`${BACKEND_URL}/api/v1/author/works/:workId/setting`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return HttpResponse.json({
      success: true,
      message: '설정집이 성공적으로 반영되었습니다.',
    });
  }),

  // Search Lorebook Similarity (Lorebook Q&A / Similarity)
  http.post(
    `${BACKEND_URL}/api/v1/author/lorebooks/:workId/userQ`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return HttpResponse.json(
        generateList(3, (i) => ({
          id: i,
          title: `유사한 설정 ${i}`,
          content: '기존 설정집에서 발견된 유사한 내용입니다.',
          similarity: 85 - i * 5,
        })),
      );
    },
  ),

  // 5.6 Author-Manager Linkage Code Generation
  http.post(`${BACKEND_URL}/api/v1/author/manager/code`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Generate a 6-digit random number string
    const randomCode = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now

    return HttpResponse.json({
      ok: true,
      code: randomCode,
      expiresAt: expiresAt,
    });
  }),

  // 5.7 Get My Manager
  http.get(`${BACKEND_URL}/api/v1/author/manager`, () => {
    // Mock: Return a matched manager for testing "Hide Button" logic
    // Change ok to false to test "Show Button"
    return HttpResponse.json({
      ok: true,
      managerIntegrationId: 'MGR-001',
      managerName: '김매니저',
      managerSiteEmail: 'manager@example.com',
    });
  }),

  // ======================================================================
  // 6. Author Manuscript & Lorebook API (New Specs)
  // ======================================================================

  // Manuscript List
  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/list`,
    ({ request, params }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') || 0);
      const size = Number(url.searchParams.get('size') || 10);

      const title = decodeURIComponent(String(params.title));
      const work = MOCK_WORKS.find((w) => w.title === title);

      let list = [];
      if (work) {
        list = MOCK_MANUSCRIPTS.get(work.id) || [];
      } else {
        // Fallback or empty if not found
        list = [];
      }

      // Sort by episode desc
      list.sort((a, b) => b.episode - a.episode);

      const total = list.length;
      const content = list.slice(page * size, (page + 1) * size);

      return HttpResponse.json({
        content,
        page,
        size,
        totalElements: total,
        totalPages: Math.ceil(total / size),
      });
    },
  ),

  // Manuscript Upload
  http.post(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/upload`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      const workId = Number(body.workId);

      if (!MOCK_MANUSCRIPTS.has(workId)) {
        MOCK_MANUSCRIPTS.set(workId, []);
      }

      const list = MOCK_MANUSCRIPTS.get(workId)!;
      const newId = Math.floor(Math.random() * 100000);

      const newManuscript = {
        id: newId,
        workId: workId,
        episode: body.episode,
        subtitle: body.subtitle,
        createdAt: new Date().toISOString(),
        txt: body.txt,
      };

      list.push(newManuscript);

      // Update Work Status if NEW
      const workIndex = MOCK_WORKS.findIndex((w) => w.id === workId);
      if (workIndex !== -1) {
        if (MOCK_WORKS[workIndex].status === 'NEW') {
          MOCK_WORKS[workIndex].status = 'ONGOING';
          MOCK_WORKS[workIndex].updatedAt = new Date().toISOString();
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      return HttpResponse.json({ success: true, message: 'Upload successful' });
    },
  ),

  // Manuscript Detail
  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/:manuscriptId`,
    ({ params }) => {
      const id = Number(params.manuscriptId);
      let found = null;

      for (const [_, list] of MOCK_MANUSCRIPTS) {
        found = list.find((m) => m.id === id);
        if (found) break;
      }

      if (found) {
        return HttpResponse.json(found);
      }
      return new HttpResponse(null, { status: 404 });
    },
  ),

  // Manuscript Delete
  http.delete(
    `${BACKEND_URL}/api/v1/author/:userId/:title/manuscript/:manuscriptId`,
    ({ params }) => {
      const id = Number(params.manuscriptId);
      let workId = -1;

      for (const [wId, list] of MOCK_MANUSCRIPTS) {
        const idx = list.findIndex((m) => m.id === id);
        if (idx !== -1) {
          list.splice(idx, 1);
          workId = wId;
          break;
        }
      }

      if (workId !== -1) {
        const list = MOCK_MANUSCRIPTS.get(workId)!;
        if (list.length === 0) {
          const workIndex = MOCK_WORKS.findIndex((w) => w.id === workId);
          if (workIndex !== -1) {
            MOCK_WORKS[workIndex].status = 'NEW';
            MOCK_WORKS[workIndex].updatedAt = new Date().toISOString();
          }
        }
      }

      return HttpResponse.json({ success: true });
    },
  ),

  // Lorebook List (All)
  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook`,
    ({ request }) => {
      // Returns a flat list or categorized list? Spec says "Lorebook List (All)".
      // Assuming returns a list of LorebookDto
      return HttpResponse.json(
        generateList(10, (i) => ({
          id: i,
          title: `설정 ${i}`,
          description: '설정 설명...',
          updatedAt: new Date().toISOString(),
          category: getRandomItem([
            '인물',
            '세계',
            '장소',
            '사건',
            '물건',
            '집단',
          ]),
        })),
      );
    },
  ),

  // Lorebook List (Category)
  http.get(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category`,
    ({ params }) => {
      const category = String(params.category);
      // Generate mock data based on category
      return HttpResponse.json(
        generateList(5, (i) => {
          let settings = {};
          if (category === 'characters') {
            settings = {
              role: '주연',
              age: '20세',
              traits: ['용감함', '지혜로움'],
            };
          } else if (category === 'places') {
            settings = { location: '북부', features: ['춥다', '산악지대'] };
          }

          return {
            id: i,
            title: `${category} 설정 ${i}`,
            description: `${category}에 대한 설명입니다.`,
            updatedAt: new Date().toISOString(),
            category: category,
            settings: JSON.stringify(settings),
          };
        }),
      );
    },
  ),

  // Lorebook Create
  http.post(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category`,
    async ({ request, params }) => {
      const category = String(params.category);
      const body = (await request.json()) as any;
      return HttpResponse.json({
        id: Math.floor(Math.random() * 1000),
        title: body.title,
        description: body.description,
        updatedAt: new Date().toISOString(),
        category: category,
        settings: body.settings,
      });
    },
  ),

  // Lorebook Update
  http.put(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category/:lorebookId`,
    async ({ request, params }) => {
      const category = String(params.category);
      const id = Number(params.lorebookId);
      const body = (await request.json()) as any;
      return HttpResponse.json({
        id: id,
        title: body.title,
        description: body.description,
        updatedAt: new Date().toISOString(),
        category: category,
        settings: body.settings,
      });
    },
  ),

  // Lorebook Delete
  http.delete(
    `${BACKEND_URL}/api/v1/author/:userId/:title/lorebook/:category/:lorebookId`,
    () => {
      return HttpResponse.json({ success: true });
    },
  ),

  // Lorebook Similarity Search
  http.post(
    `${BACKEND_URL}/api/v1/ai/author/:userId/:title/lorebook/userq`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      return HttpResponse.json(
        generateList(body.limit || 3, (i) => ({
          id: i,
          title: `유사 설정 ${i}`,
          description: `사용자 질문 "${body.user_query}"에 대한 유사 설정입니다.`,
          category: body.category === '*' ? '인물' : body.category,
          similarity: 0.85 - i * 0.1,
        })),
      );
    },
  ),

  // Lorebook Manual Save
  http.post(
    `${BACKEND_URL}/api/v1/ai/author/:userId/:title/lorebook/setting_save`,
    () => {
      return HttpResponse.json({
        success: true,
        message: 'Saved successfully',
      });
    },
  ),

  // Lorebook Update
  http.patch(
    `${BACKEND_URL}/api/v1/ai/author/:userId/:title/lorebook/:category/:lorebookId`,
    () => {
      return HttpResponse.json({
        success: true,
        message: 'Updated successfully',
      });
    },
  ),

  // 5.6 Author Manager
  http.get(`${BACKEND_URL}/api/v1/author/manager`, () => {
    return HttpResponse.json({
      managerId: 'manager_123',
      managerName: '김운영',
      managerEmail: 'manager_kim@ip-ergo-sum.com',
      managerIntegrationId: 'mg_int_12345',
      linkedAt: '2025-01-15T09:00:00',
    });
  }),
];
