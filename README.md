# AI Novel Platform Frontend (IP-Ergo-Sum)

AIVLE SCHOOL 8th Big Project - AI 기반 웹소설 창작 및 관리 플랫폼 프론트엔드 리포지토리입니다.

## 📖 프로젝트 개요

이 프로젝트는 AI 기술을 활용하여 웹소설 창작을 지원하고, IP(Intellectual Property) 확장을 용이하게 관리할 수 있는 통합 플랫폼입니다. 관리자(Admin), 운영자(Manager), 작가(Author)를 위한 맞춤형 대시보드를 제공하여 효율적인 작업 환경을 보장합니다.

## ✨ 주요 기능

- **역할별 대시보드 (Role-Based Dashboards)**:
  - **Admin (관리자)**: 시스템 모니터링, 사용자 권한 관리(비활성화 포함), 시스템 공지 관리.
  - **Manager (운영자)**: 작가 및 작품 관리, IP 확장(OSMU) 제안 및 관리.
  - **Author (작가)**: 웹소설 집필 스튜디오, AI 설정집(Lorebook) 관리, 원고 분석 및 IP 제안 확인, 작품/원문 관리(우클릭 메뉴).

- **AI 통합 (AI Integration)**:
  - AI 보조 집필 및 설정 오류 탐지.
  - 3단계 프롬프트 엔지니어링을 통한 IP 확장 제안서 자동 생성.

- **사용자 경험 (UX)**:
  - `shadcn/ui` 및 `Tailwind CSS` 기반의 미니멀하고 직관적인 UI.
  - 다크 모드 지원 및 반응형 디자인.
  - 권한 회수 및 탈퇴 시 7일 유예 기간 적용으로 실수 방지.

## 🛠 기술 스택

- **Framework**: [React](https://react.dev/) (Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (Server state), Context API (Client state)
- **Routing**: [React Router](https://reactrouter.com/)
- **Mocking**: [MSW (Mock Service Worker)](https://mswjs.io/) (백엔드 API 모킹)
- **Deployment**: Vercel (예정)

## 📂 프로젝트 구조

```
src/
├── app/
│   ├── api/            # Axios 인스턴스 및 인터셉터 설정
│   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   ├── ui/         # Shadcn UI 기본 컴포넌트
│   │   └── ...         # 공통 컴포넌트
│   ├── pages/          # 페이지 컴포넌트 (라우팅 단위)
│   │   ├── auth/       # 로그인, 회원가입 등 인증 관련 페이지
│   │   ├── dashboard/  # 대시보드 메인
│   │   │   ├── admin/  # 관리자 전용 페이지 (권한, 로그, 공지 등)
│   │   │   ├── manager/# 운영자 전용 페이지 (IP확장, 작가관리 등)
│   │   │   └── author/ # 작가 전용 페이지 (집필, 설정집, 마이페이지 등)
│   │   └── landing/    # 랜딩 페이지
│   ├── services/       # API 통신 로직 (authService, adminService 등)
│   ├── types/          # TypeScript 인터페이스 및 DTO 정의
│   └── routes.tsx      # 라우터 설정
├── assets/             # 정적 이미지 및 리소스
├── mocks/              # MSW 핸들러 및 모의 데이터 (handlers.ts)
└── styles/             # 전역 스타일 (globals.css)
```

## 🚀 시작하기 (Getting Started)

### 사전 요구사항

- Node.js (v18 이상 권장)
- npm

### 설치 및 실행

1. **의존성 설치**:

   ```bash
   npm install
   ```

2. **개발 서버 실행**:

   ```bash
   npm run dev
   ```

   - 브라우저에서 `http://localhost:5173` 접속.
   - 백엔드 연결이 없을 경우 MSW가 자동으로 활성화되어 모의 데이터로 동작합니다.

3. **빌드**:
   ```bash
   npm run build
   ```

## 📝 API 문서

상세한 API 명세는 보안상 별도 관리되거나 `개인자료` 폴더(Git 제외)에 포함되어 있습니다.
(백엔드 레퍼런스: `backend_reference` 참고)

## 🔒 보안 및 인증

- **JWT 인증**: Access Token은 메모리 변수/헤더로 관리, Refresh Token은 HttpOnly Cookie로 관리합니다.
- **CSRF 보호**: 네이버 OAuth 로그인 시 State 토큰 검증을 수행합니다.
- **RBAC**: 사용자 역할(Admin, Manager, Author)에 따른 철저한 접근 제어를 구현했습니다.

## 🤝 기여 (Contribution)

관련 내용 추가 예정

## 📄 라이선스

관련 내용 추가 예정
