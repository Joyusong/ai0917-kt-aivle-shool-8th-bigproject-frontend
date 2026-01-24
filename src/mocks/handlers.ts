import { http, HttpResponse } from 'msw';

// Define the base URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Helper to generate large datasets
const generateList = <T>(count: number, generator: (index: number) => T): T[] =>
  Array.from({ length: count }, (_, i) => generator(i + 1));

// Helper to get random status
const getRandomStatus = () => {
  const statuses = ['UPLOADED', 'ANALYZING', 'ANALYSIS_COMPLETED', 'FAILED'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

// Helper to get random genre
const getRandomGenre = () => {
  const genres = [
    '현대판타지',
    '무협',
    '로맨스판타지',
    'SF',
    '대체역사',
    '스포츠',
  ];
  return genres[Math.floor(Math.random() * genres.length)];
};

export const handlers = [
  // ----------------------------------------------------------------------
  // Auth & Test
  // ----------------------------------------------------------------------

  // Mock: Auth - Me (Session Check)
  http.get(`${BACKEND_URL}/api/v1/auth/me`, () => {
    // Check if session exists in localStorage (as requested by user)
    // Note: In a real browser environment, MSW handlers run in the client context
    // and can access localStorage.
    const storedRole = localStorage.getItem('msw-session-role');

    if (storedRole) {
      return HttpResponse.json({
        type: 'AUTH',
        role: storedRole, // Admin, Manager, Author
        id: 1,
        email: 'author@test.com',
        name: 'Test User',
        siteEmail: 'author@test.com',
      });
    }

    // If no session, return 401
    return new HttpResponse(null, { status: 401 });
  }),

  // Mock: Password Reset - Request Code
  http.post(`${BACKEND_URL}/api/v1/signup/password/email/request`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return HttpResponse.json({
      success: true,
      message: '인증 코드가 발송되었습니다.',
    });
  }),

  // Mock: Email Verification
  http.post(
    `${BACKEND_URL}/api/v1/signup/email/verify`,
    async ({ request }) => {
      const body = (await request.json()) as { code: string };
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (body.code === '1234') {
        return HttpResponse.json({
          ok: true,
          message: '인증되었습니다.',
        });
      }
      return new HttpResponse(
        JSON.stringify({
          message: '인증 코드가 올바르지 않습니다. (테스트 코드: 1234)',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    },
  ),

  // Mock: Signup - Complete
  http.post(`${BACKEND_URL}/api/v1/signup/complete`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Auto-login after signup? Let's say yes for convenience, defaulting to Author
    localStorage.setItem('msw-session-role', 'Author');
    return HttpResponse.json({
      ok: true,
      message: '회원가입이 완료되었습니다.',
    });
  }),

  // Mock: Password Reset - Reset Password
  http.post(`${BACKEND_URL}/api/v1/signup/password/reset`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return HttpResponse.json({
      success: true,
      message: '비밀번호가 변경되었습니다.',
    });
  }),

  // Mock: Auth - Login
  http.post(`${BACKEND_URL}/api/v1/auth/login`, async ({ request }) => {
    const info = (await request.json()) as any;
    console.log('Login attempt with:', info);

    let role = 'Author'; // Default
    const email = info.siteEmail || '';
    if (email.includes('admin')) role = 'Admin';
    else if (email.includes('manager')) role = 'Manager';

    // Set session in localStorage
    localStorage.setItem('msw-session-role', role);

    return HttpResponse.json({
      success: true,
      message: 'Login successful (Mocked)',
      role: role,
      type: 'AUTH',
    });
  }),

  // Mock: Auth - Naver Login
  http.get(`${BACKEND_URL}/api/v1/auth/naver/login`, () => {
    return HttpResponse.json({
      url: 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=TEST_CLIENT_ID&redirect_uri=http://localhost:3000/auth/naver/callback&state=TEST_STATE',
      message: 'Naver Login URL generated (Mocked)',
    });
  }),

  // Mock: Auth - Logout
  http.post(`${BACKEND_URL}/api/v1/auth/logout`, () => {
    localStorage.removeItem('msw-session-role');
    return HttpResponse.json({
      success: true,
      message: 'Logout successful (Mocked)',
    });
  }),

  // Mock: Test - Hello
  http.get(`${BACKEND_URL}/api/v1/hello`, () => {
    return new HttpResponse('helloUser AIVLE SCHOOL 8th', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),

  // Mock: Test - Naver Hello
  http.get(`${BACKEND_URL}/api/v1/auth/naver/hello`, () => {
    return new HttpResponse('naverhelloUser AIVLE SCHOOL 8th', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }),

  // Mock: Test - SQL Data
  http.get(`${BACKEND_URL}/api/v1/api/test`, () => {
    return HttpResponse.json(
      generateList(30, (i) => ({
        id: i,
        name: `테스트 데이터 ${i}`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      })),
    );
  }),

  // ----------------------------------------------------------------------
  // Admin Dashboard
  // ----------------------------------------------------------------------

  // Dashboard Summary
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/summary`, () => {
    return HttpResponse.json({
      totalUsers: 1250,
      activeUsers: 850,
      totalSales: 15000000,
      serverStatus: 'NORMAL',
    });
  }),

  // Dashboard DAU
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/dau`, () => {
    return HttpResponse.json({
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'DAU',
          data: [120, 190, 300, 250, 200, 350, 400],
        },
      ],
    });
  }),

  // Dashboard Resources
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/resources`, () => {
    return HttpResponse.json({
      cpu: 45,
      memory: 60,
      disk: 30,
    });
  }),

  // Dashboard Deployment
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/deployment`, () => {
    return HttpResponse.json({
      lastDeployedAt: new Date().toISOString(),
      version: 'v1.2.3',
      status: 'SUCCESS',
    });
  }),

  // Dashboard System Logs
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard/logs`, () => {
    const logs = generateList(50, (i) => ({
      id: i,
      level: i % 10 === 0 ? 'ERROR' : i % 5 === 0 ? 'WARN' : 'INFO',
      message: `System log message ${i} - ${
        i % 10 === 0 ? 'Critical Error Occurred' : 'Operation Successful'
      }`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      service: i % 2 === 0 ? 'AuthService' : 'OrderService',
    }));
    return HttpResponse.json({ logs });
  }),

  // System Notices (Top Bar Bell Icon)
  http.get(`${BACKEND_URL}/api/v1/admin/sysnotice`, () => {
    return HttpResponse.json({
      notices: generateList(25, (i) => ({
        id: i,
        title: `System Alert ${i}`,
        message: `System maintenance scheduled for ${i} hours later.`,
        isRead: i > 5,
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
        source: 'SYSTEM',
      })),
    });
  }),

  // Mark All System Notices as Read
  http.patch(`${BACKEND_URL}/api/v1/admin/sysnotice/read-all`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Notice Management (Admin Page)
  http.get(`${BACKEND_URL}/api/v1/admin/notice`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const total = 45;

    const content = generateList(size, (i) => ({
      id: page * size + i,
      title: `공지사항 제목 ${page * size + i}`,
      content: `공지사항 내용입니다. ${page * size + i}`,
      author: 'Admin',
      createdAt: new Date(
        Date.now() - (page * size + i) * 86400000,
      ).toISOString(),
      viewCount: Math.floor(Math.random() * 100),
      isImportant: (page * size + i) % 5 === 0,
      hasFile: (page * size + i) % 3 === 0,
    }));

    return HttpResponse.json({
      content,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      last: (page + 1) * size >= total,
    });
  }),

  // Notice Create
  http.post(`${BACKEND_URL}/api/v1/admin/notice`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return HttpResponse.json({ success: true, message: 'Notice created' });
  }),

  // Notice Delete
  http.delete(`${BACKEND_URL}/api/v1/admin/notice/:id`, () => {
    return HttpResponse.json({ success: true, message: 'Notice deleted' });
  }),

  // User Access Management Summary
  http.get(`${BACKEND_URL}/api/v1/admin/access/summary`, () => {
    return HttpResponse.json({
      totalAdmins: 5,
      totalManagers: 12,
      totalAuthors: 150,
      pendingApprovals: 3,
    });
  }),

  // User List
  http.get(`${BACKEND_URL}/api/v1/admin/access/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 0);
    const size = Number(url.searchParams.get('size') || 10);
    const role = url.searchParams.get('role');
    const total = 120;

    const content = generateList(size, (i) => {
      const id = page * size + i;
      const roles = ['Admin', 'Manager', 'Author'];
      const currentRole = role || roles[id % 3];

      return {
        id,
        email: `user${id}@example.com`,
        name: `User ${id}`,
        role: currentRole,
        status: id % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
        lastLoginAt: new Date(Date.now() - id * 3600000).toISOString(),
        createdAt: new Date(Date.now() - id * 86400000 * 30).toISOString(),
      };
    });

    return HttpResponse.json({
      content,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      last: (page + 1) * size >= total,
    });
  }),

  // User Detail
  http.get(`${BACKEND_URL}/api/v1/admin/access/users/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      email: `user${params.id}@example.com`,
      name: `User ${params.id}`,
      role: 'Author',
      status: 'ACTIVE',
      mobile: '010-1234-5678',
      createdAt: '2025-01-01',
      lastLoginAt: '2026-01-24',
    });
  }),

  // User Update
  http.patch(`${BACKEND_URL}/api/v1/admin/access/users/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // User Delete
  http.delete(`${BACKEND_URL}/api/v1/admin/access/users/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // ----------------------------------------------------------------------
  // Author Dashboard
  // ----------------------------------------------------------------------

  // Dashboard Summary
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/summary`, () => {
    return HttpResponse.json({
      ongoingWorks: 15,
      createdLorebooks: 25,
      completedWorks: 12,
      totalViews: 125000,
      monthlyGrowth: 15.4,
    });
  }),

  // Dashboard Notice (Latest)
  http.get(`${BACKEND_URL}/api/v1/author/dashboard/notice`, () => {
    return HttpResponse.json(
      generateList(20, (i) => ({
        id: 100 + i,
        title:
          i === 1
            ? '[공지] 시스템 점검 안내 (1/25)'
            : i === 2
              ? '신규 기능: AI 설정 자동 생성 가이드'
              : `[필독] 작가님들을 위한 ${i}월 운영 정책 안내`,
        createdAt: new Date(Date.now() - i * 86400000)
          .toISOString()
          .split('T')[0],
        isNew: i <= 3,
      })),
    );
  }),

  // Manuscript List
  http.get(`${BACKEND_URL}/api/v1/author/manuscript/list`, () => {
    const list = generateList(30, (i) => ({
      id: i,
      title:
        i % 2 === 0 ? `전지적 독자 시점 ${i}화` : `나 혼자만 레벨업 ${i}화`,
      status: getRandomStatus(),
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      fileSize: `${10 + (i % 20)}KB`,
      fileName:
        i % 2 === 0
          ? `omniscient_reader_ep${i}.txt`
          : `solo_leveling_ep${i}.docx`,
    }));
    return HttpResponse.json(list);
  }),

  // Upload Manuscript
  http.post(
    `${BACKEND_URL}/api/v1/author/manuscript/upload`,
    async ({ request }) => {
      // Read FormData to simulate handling file input
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const title = formData.get('title') as string;

      console.log('[MSW] Uploading manuscript:', {
        fileName: file?.name,
        fileSize: file?.size,
        title,
      });

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return HttpResponse.json({
        success: true,
        message: `파일 '${file?.name || 'unknown'}'이(가) 업로드되었습니다. 분석이 시작됩니다.`,
        id: Date.now(), // Generate dynamic ID
      });
    },
  ),

  // Manuscript Detail
  http.get(`${BACKEND_URL}/api/v1/author/manuscript/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: `원문 상세 조회 ${params.id}`,
      content:
        '이 이야기는 멸망한 세계에서 살아남는 방법에 대한 이야기다... (더미 데이터)',
      analysisResult: {
        characters: ['김독자', '유중혁', '한수영', '이현성', '정희원'],
        keywords: ['성좌', '시나리오', '도깨비', '배후성', '화신'],
        summary:
          '주인공 김독자가 자신이 읽던 소설의 세계로 변해버린 현실에서 생존하는 이야기.',
      },
      status: 'ANALYSIS_COMPLETED',
      createdAt: '2026-01-23T10:00:00',
    });
  }),

  // Delete Manuscript
  http.delete(`${BACKEND_URL}/api/v1/author/manuscript/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: '원문이 삭제되었습니다.',
    });
  }),

  // Lorebook List (Work List)
  http.get(`${BACKEND_URL}/api/v1/author/lorebook`, () => {
    const list = generateList(25, (i) => ({
      workId: i,
      title: `나의 대작 소설 ${i}`,
      genre: getRandomGenre(),
      characterCount: 10 + (i % 30),
      worldviewCount: 2 + (i % 10),
      lastUpdated: new Date(Date.now() - i * 86400000)
        .toISOString()
        .split('T')[0],
    }));
    return HttpResponse.json(list);
  }),

  // Lorebook Detail
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId`, ({ params }) => {
    return HttpResponse.json({
      workId: params.workId,
      title: `나의 대작 소설 ${params.workId}`,
      description: '오직 나만이 이 세계의 결말을 알고 있다.',
      genre: getRandomGenre(),
      tags: ['성좌', '아포칼립스', '시스템', '회귀', '빙의', '환생'],
      coverImage: 'https://via.placeholder.com/150',
    });
  }),

  // Lorebook Characters
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/characters`, () => {
    const list = generateList(20, (i) => ({
      id: i,
      name: `등장인물 ${i}`,
      role: i === 1 ? '주인공' : i < 5 ? '주요 인물' : '조연',
      description: `이 캐릭터는 ${i}번째로 중요한 인물입니다.`,
      traits: ['지능적', '냉철', '강함', '비겁함', '용기있음'].slice(
        0,
        2 + (i % 3),
      ),
    }));
    return HttpResponse.json(list);
  }),

  // Add Lorebook Item (Character/Worldview)
  http.post(
    `${BACKEND_URL}/api/v1/author/lorebook/:workId/items`,
    async ({ request, params }) => {
      const data = await request.json(); // Read JSON Body
      console.log(`[MSW] Adding item to work ${params.workId}:`, data);

      return HttpResponse.json({
        success: true,
        message: '항목이 성공적으로 추가되었습니다.',
        id: Date.now(),
        data, // Echo back
      });
    },
  ),

  // Lorebook Worldview (v2)
  http.get(`${BACKEND_URL}/api/v2/author/lorebook/:workId/worldview`, () => {
    const list = generateList(25, (i) => ({
      id: i,
      name: `세계관 설정 ${i}`,
      type: i % 2 === 0 ? '시스템' : '지역',
      description: `이 세계관의 ${i}번째 설정입니다. 아주 중요합니다.`,
    }));
    return HttpResponse.json(list);
  }),

  // Lorebook Narrative
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/narrative`, () => {
    const list = generateList(25, (i) => ({
      id: i,
      title: `메인 시나리오 #${i}`,
      description: `가치를 증명하라. ${i}분 내에 목표를 달성하라.`,
      order: i,
    }));
    return HttpResponse.json(list);
  }),

  // AI Review
  http.get(`${BACKEND_URL}/api/v1/author/lorebook/:workId/ai-review`, () => {
    return HttpResponse.json({
      issues: generateList(10, (i) => ({
        id: i,
        severity: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW',
        type: i % 2 === 0 ? 'CONFLICT' : 'SUGGESTION',
        message: `설정 충돌 혹은 제안 사항 ${i}입니다.`,
        suggestion: `이 부분을 이렇게 수정해보세요. (${i})`,
      })),
      lastScanned: '2026-01-24T10:00:00',
    });
  }),

  // Notice List
  http.get(`${BACKEND_URL}/api/v1/author/notice/list`, () => {
    const content = generateList(30, (i) => ({
      id: i,
      title: `[공지] ${i}월 시스템 업데이트 및 점검 안내`,
      author: i % 2 === 0 ? '관리자' : '운영팀',
      createdAt: new Date(Date.now() - i * 86400000)
        .toISOString()
        .split('T')[0],
      views: 100 + i * 5,
    }));

    return HttpResponse.json({
      content,
      totalPages: 3,
      totalElements: 30,
      size: 10,
      number: 0,
    });
  }),

  // Notice Detail
  http.get(`${BACKEND_URL}/api/v1/author/notice/:id`, ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: `[공지] 상세 공지사항 내용 ${params.id}`,
      content: `안녕하세요, 작가님들.\n\n이것은 ${params.id}번 공지사항의 상세 내용입니다.\n더미 데이터이므로 실제 내용은 없습니다.\n\n감사합니다.`,
      author: '관리자',
      createdAt: '2026-01-20',
      views: 151,
      files: [],
    });
  }),

  // My Page
  http.get(`${BACKEND_URL}/api/v1/author/:userId/mypage`, () => {
    return HttpResponse.json({
      name: 'Test Author',
      email: 'author@test.com',
      phone: '010-1234-5678',
      joinDate: '2025-09-17',
      bio: '판타지 소설을 주력으로 집필하고 있습니다. (Mock)',
      profileImage: 'https://via.placeholder.com/150',
    });
  }),

  // Update My Page
  http.put(
    `${BACKEND_URL}/api/v1/author/:userId/mypage`,
    async ({ request, params }) => {
      const data = await request.json();
      console.log(`[MSW] Updating profile for user ${params.userId}:`, data);

      return HttpResponse.json({
        success: true,
        message: '프로필이 수정되었습니다.',
        updatedProfile: data,
      });
    },
  ),

  // My Page Stats
  http.get(`${BACKEND_URL}/api/v1/author/:userId/mypage/stats`, () => {
    return HttpResponse.json({
      totalWorks: 15,
      totalViews: 125000,
      followers: 1200,
      avgRating: 4.8,
    });
  }),

  // System Settings
  http.get(`${BACKEND_URL}/api/v1/author/:userId/setting`, () => {
    return HttpResponse.json({
      emailNotification: true,
      pushNotification: false,
      aiAutoAnalysis: true,
      theme: 'system',
    });
  }),

  // System Notices (Bell Icon)
  http.get(`${BACKEND_URL}/api/v1/author/sysnotice`, () => {
    const list = generateList(25, (i) => ({
      id: i,
      message:
        i % 2 === 0
          ? `원문 "전지적 독자 시점 ${i}화" 분석이 완료되었습니다.`
          : `새로운 공지사항 ${i}이 등록되었습니다.`,
      type: i % 2 === 0 ? 'INFO' : 'NOTICE',
      read: i > 5, // First 5 are unread
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    }));
    return HttpResponse.json(list);
  }),

  // ----------------------------------------------------------------------
  // Admin Dashboard (Basic Mocks to prevent errors)
  // ----------------------------------------------------------------------
  http.get(`${BACKEND_URL}/api/v1/admin/dashboard`, () => {
    return HttpResponse.json({ message: 'Admin Dashboard Mock' });
  }),
];
