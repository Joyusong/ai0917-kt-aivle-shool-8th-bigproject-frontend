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

const ROLES = [
  '주인공',
  '히로인',
  '라이벌',
  '조력자',
  '최종 보스',
  '스승',
  '동료',
  '악역',
  '엑스트라',
  '가족',
];

let contestTemplates = generateList(10, (i) => ({
  id: i,
  title: `2026 ${getRandomItem(GENRES)} 공모전`,
  organizer: getRandomItem([
    '네이버웹툰',
    '카카오페이지',
    '리디북스',
    '문피아',
    '조아라',
  ]),
  prize: `${(i + 1) * 1000}만원`,
  deadline: `2026-12-${31 - i}`,
  category: getRandomItem(GENRES),
  status: 'OPEN',
  description:
    '이 공모전은 신인 작가 발굴을 위한 최고의 기회입니다. 당신의 상상력을 펼쳐보세요!',
  isAiSupported: i % 2 === 0,
}));

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
      deactivatedCount: 45, // Added mock data
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
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days later
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
  http.get(`${BACKEND_URL}/api/v1/admin/notice`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);

    return HttpResponse.json({
      content: generateList(size, (i) => ({
        id: page * size + i,
        title: `[공지] 시스템 점검 안내 ${page * size + i}`,
        author: 'Admin',
        createdAt: new Date().toISOString(),
        viewCount: Math.floor(Math.random() * 500),
        status: 'POSTED',
      })),
      totalElements: 50,
      totalPages: 5,
    });
  }),

  // ======================================================================
  // 4. Manager API
  // ======================================================================

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
  http.get(`${BACKEND_URL}/api/v1/manager/dashboard/contest`, () =>
    HttpResponse.json(
      generateList(3, (i) => ({
        id: i,
        title: `제${i}회 SF 공모전`,
        status: 'ONGOING',
        endDate: '2026-02-28',
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
  http.get(`${BACKEND_URL}/api/v1/manager/iptrend/genre`, () =>
    HttpResponse.json([
      { genre: '판타지', growth: 12.5 },
      { genre: '로맨스판타지', growth: 8.2 },
      { genre: '무협', growth: -2.1 },
    ]),
  ),
  http.get(`${BACKEND_URL}/api/v1/manager/contest/list`, () =>
    HttpResponse.json({
      content: generateList(5, (i) => ({
        id: i,
        title: `2026 ${getRandomItem(GENRES)} 공모전`,
        prize: '1억원',
        status: 'OPEN',
      })),
    }),
  ),

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

  // ======================================================================
  // 5. Author API
  // ======================================================================

  // 5.1 Dashboard
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/summary`, () =>
    HttpResponse.json({
      ongoingWorks: 3,
      createdLorebooks: 5,
      completedWorks: 2,
      totalViews: 154200,
      monthlyGrowth: 12.4,
    }),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/notice`, () =>
    HttpResponse.json({
      content: generateList(10, (i) => ({
        id: i,
        title: `[공지] 작가님 필독! ${i}월 정산 안내 및 가이드라인`,
        isNew: i < 3,
        createdAt: new Date().toISOString().split('T')[0],
      })),
      totalPages: 1,
      totalElements: 10,
    }),
  ),

  // 5.2 Works
  http.get(`${BACKEND_URL}/api/v1/author/works`, () =>
    HttpResponse.json(
      generateList(15, (i) => ({
        id: i,
        title: TITLES[i % TITLES.length] || `새로운 작품 ${i}`,
        description: '이 작품은 대단한 작품입니다.',
        genre: GENRES[i % GENRES.length],
        status: i % 2 === 0 ? 'SERIES' : 'DRAFT', // WorkStatus: SERIES, COMPLETED, DRAFT
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        coverImage: 'https://via.placeholder.com/150',
        episodeCount: 50 + i * 5,
      })),
    ),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/works/:id`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.id),
      title: TITLES[Number(params.id) % TITLES.length],
      description: '상세 설명입니다.',
      status: 'SERIES',
      genre: GENRES[Number(params.id) % GENRES.length],
      createdAt: '2026-01-01',
      updatedAt: new Date().toISOString(),
    }),
  ),
  http.get(
    `${BACKEND_URL}/api/v1/author/works/:workId/episodes`,
    ({ params }) =>
      HttpResponse.json(
        generateList(50, (i) => ({
          id: i,
          workId: Number(params.workId),
          title: `제 ${i}화 - ${['각성', '만남', '위기', '절정', '결말', '새로운 시작', '비밀', '배신', '화해', '전투'][i % 10]}`,
          order: i,
          status: 'PUBLISHED',
          updatedAt: new Date().toISOString(),
          viewCount: 1000 + i * 50,
        })),
      ),
  ),
  http.get(
    `${BACKEND_URL}/api/v1/author/works/:workId/episodes/:episodeId`,
    ({ params }) =>
      HttpResponse.json({
        id: Number(params.episodeId),
        workId: Number(params.workId),
        title: `제 ${params.episodeId}화 - 상세 내용`,
        content:
          `이곳은 ${TITLES[Number(params.workId) % TITLES.length]}의 ${params.episodeId}화 본문입니다.\n\n` +
          `[제 ${params.episodeId}화]\n\n` +
          `주인공은 깊은 숨을 내쉬었다.\n` +
          `"이제 시작이다."\n\n` +
          `그는 검을 꽉 쥐었다. 손바닥에 땀이 배어 나왔지만, 눈빛만은 흔들리지 않았다. ` +
          `앞에 서 있는 거대한 몬스터는 ${TITLES[Number(params.workId) % TITLES.length]} 세계관 최강의 적 중 하나였다.\n\n` +
          `"덤벼라!"\n\n` +
          `(중략)\n\n` +
          `그렇게 싸움은 끝이 났다. 하지만 이것은 시작에 불과했다.\n` +
          `다음 화에 계속...`,
        status: 'PUBLISHED',
      }),
  ),
  http.put(
    `${BACKEND_URL}/api/v1/author/works/:workId/episodes/:episodeId`,
    async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json({
        success: true,
        message: '저장되었습니다.',
        data: body,
      });
    },
  ),

  // 5.3 Manuscript
  http.get(`${BACKEND_URL}/api/v1/author/manuscript/list`, () =>
    HttpResponse.json(
      generateList(20, (i) => ({
        id: i,
        title: `${getRandomItem(TITLES)} - 원고 ${i}`,
        status: getRandomItem(['ANALYZING', 'COMPLETED', 'FAILED']),
        fileSize: '1.2MB',
        fileName: `manuscript_${i}.docx`,
        createdAt: new Date().toISOString(),
      })),
    ),
  ),

  // 5.4 Lorebook
  http.get(`${BACKEND_URL}/api/v1/author/lorebook`, () =>
    HttpResponse.json(
      generateList(5, (i) => ({
        id: i,
        title: `${TITLES[i % TITLES.length]} 설정집`,
        description: '작품의 세계관, 인물, 사건 등을 정리한 설정집입니다.',
        updatedAt: new Date().toISOString(),
        count: 15 + i * 3,
      })),
    ),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/characters`, () =>
    HttpResponse.json(
      generateList(15, (i) => ({
        id: i,
        name: NAMES[i % NAMES.length],
        role: ROLES[i % ROLES.length],
        description: `${NAMES[i % NAMES.length]}은(는) 이 작품의 ${ROLES[i % ROLES.length]}입니다. 성격은 냉철하지만 내면은 따뜻합니다.`,
        traits: ['정의', '검술', '마법', '지략', '행운'],
        imageUrl: `https://via.placeholder.com/150?text=${NAMES[i % NAMES.length]}`,
      })),
    ),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/worldview`, () =>
    HttpResponse.json(
      generateList(10, (i) => ({
        id: i,
        title: `세계관 설정 - ${['마법탑', '황궁', '북부 대공령', '마계', '천계', '아카데미', '길드', '던전', '신전', '암시장'][i % 10]}`,
        category: ['지리', '역사', '마법', '종교', '문화'][i % 5],
        description:
          '이 구역은 대륙의 중심에 위치하며, 강력한 마력의 흐름이 모이는 곳입니다. 고대부터 전해져 내려오는 전설이 깃들어 있습니다.',
        tags: ['중요', '위험', '비밀', '보물'],
      })),
    ),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/plot`, () =>
    HttpResponse.json(
      generateList(12, (i) => ({
        id: i,
        title: `주요 사건 ${i + 1} - ${['전쟁 발발', '황제 서거', '마왕 부활', '아카데미 입학', '첫 번째 시련', '동료의 배신', '각성', '최종 결전'][i % 8]}`,
        description:
          '스토리의 큰 줄기가 되는 사건입니다. 주인공의 운명을 크게 바꾸는 계기가 됩니다.',
        order: i + 1,
        importance: i % 3 === 0 ? 'Main' : 'Sub',
      })),
    ),
  ),

  // 5.5 IP Expansion (Author View)
  http.get(`${BACKEND_URL}/api/v1/author/ip-expansion/proposals`, () =>
    HttpResponse.json(
      generateList(8, (i) => ({
        id: i,
        title: `웹툰화 제안 - ${getRandomItem(TITLES)}`,
        status: i < 3 ? 'ACCEPTED' : i < 5 ? 'REJECTED' : 'PENDING',
        statusDescription: i < 3 ? '계약 완료' : i < 5 ? '거절됨' : '검토 중',
        sender: getRandomItem(['네이버웹툰', '카카오페이지', '리디북스']),
        content: `안녕하세요, ${getRandomItem(TITLES)} 작품을 웹툰으로 제작하고 싶습니다. \n\n상세 조건은 다음과 같습니다.\n1. 계약금: 1억원\n2. 러닝개런티: 5%\n3. 제작사: 스튜디오A`,
        receivedAt: new Date(Date.now() - i * 86400000).toISOString(),
        acceptedAt: i < 3 ? new Date().toISOString() : undefined,
      })),
    ),
  ),
  http.get(`${BACKEND_URL}/api/v1/author/ip-expansion/matching`, () =>
    HttpResponse.json(
      generateList(5, (i) => ({
        id: i,
        managerName: `김매니저${i}`,
        department: 'IP사업팀',
        role: '담당 매니저',
        tags: ['웹툰', '영화', '드라마'],
        matchedAt: new Date().toISOString(),
      })),
    ),
  ),

  http.post(
    `${BACKEND_URL}/api/v1/author/ip-expansion/proposals/:id/accept`,
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        id: params.id,
        status: 'ACCEPTED',
      });
    },
  ),

  http.post(
    `${BACKEND_URL}/api/v1/author/ip-expansion/proposals/:id/reject`,
    ({ params }) => {
      return HttpResponse.json({
        success: true,
        id: params.id,
        status: 'REJECTED',
      });
    },
  ),

  // 5.6 Contest Templates
  http.get(`${BACKEND_URL}/api/v1/author/contest/templates`, () =>
    HttpResponse.json(contestTemplates),
  ),

  http.post(
    `${BACKEND_URL}/api/v1/author/contest/templates`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      const newItem = {
        id: contestTemplates.length + 1,
        title: body.title,
        organizer: body.organizer || 'User',
        prize: body.prize,
        category: body.category,
        deadline: `2026-12-${31}`, // Default deadline
        status: 'OPEN',
        description: body.description,
        isAiSupported: true,
      };
      contestTemplates = [newItem, ...contestTemplates];
      return HttpResponse.json(newItem);
    },
  ),
];
