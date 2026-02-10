import { Button } from '../../components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/ui/theme-toggle';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12 font-sans">
      <div className="w-full max-w-7xl bg-card border border-border rounded-lg p-8 shadow-sm">
        {/* 상단 네비게이션 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-base font-medium">돌아가기</span>
          </button>
          <ThemeToggle />
        </div>

        {/* 제목 섹션 */}
        <div className="flex items-center gap-3 mb-8 border-b pb-6 text-foreground">
          <FileText className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            서비스 이용약관
          </h1>
        </div>

        {/* 약관 본문 */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              최종 업데이트: 2026년 1월 21일
            </p>
            <p>
              본 약관은 IP.AI(이하 &quot;회사&quot;)가 제공하는 웹 서비스 및
              관련 제반 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무
              및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          {/* 제1조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제1조 (용어의 정의)
            </h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                &quot;서비스&quot;란 회사가 운영하는 IP.AI 플랫폼을 의미합니다.
              </li>
              <li>
                &quot;회원&quot;이란 약관에 동의하고{' '}
                <strong>이메일 인증 등 회사가 정한 절차</strong>를 마친 이용자를
                말합니다.
              </li>
            </ul>
          </section>

          {/* 제2조: 핵심 수정 부분 (이메일 인증 필수 명시) */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제2조 (이용 계약의 성립 및 승낙 거절)
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="font-semibold mb-2">
                1. 이용 계약은 다음의 과정을 거쳐 성립합니다.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>이용자의 본 약관 및 개인정보처리방침 동의</li>
                <li>
                  <strong>
                    회사가 요구하는 이메일 소유권 확인(인증코드 검증) 완료
                  </strong>
                </li>
                <li>가입 신청에 대한 회사의 승낙</li>
              </ul>
              <p className="font-semibold mb-2">
                2. 회사는 다음 경우 승낙을 거절하거나 사후에 계약을 해지할 수
                있습니다.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>타인의 명의를 도용하거나 허위 정보를 입력한 경우</li>
                <li>
                  <strong>
                    이메일 인증 절차를 정상적으로 완료하지 않은 경우
                  </strong>
                </li>
                <li>서비스의 운영을 방해할 목적으로 신청한 경우</li>
              </ul>
            </div>
          </section>

          {/* 제3조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제3조 (서비스의 내용)
            </h2>
            <p>회사는 회원에게 다음과 같은 기능을 제공합니다.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP 설정집 자동 추출 및 분석 리포트</li>
              <li>네이버 로그인 연동을 통한 간편 접속</li>
              <li>기타 IP 확장 시뮬레이션 관련 부가 기능</li>
            </ul>
          </section>

          {/* 제4조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제4조 (회원의 의무)
            </h2>
            <p>회원은 서비스를 이용할 때 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                회사가 제공하는 데이터를 무단으로 복제, 수정 또는 재판매하는
                행위
              </li>
              <li>
                자동화된 수단(스크립트, 크롤러 등)을 이용하여 서비스를 호출하는
                행위
              </li>
              <li>타인의 계정 정보를 부정하게 사용하는 행위</li>
            </ul>
          </section>

          {/* 제5조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제5조 (지식재산권 및 데이터 활용)
            </h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                회원이 서비스에 업로드한 콘텐츠(작품 원문 등)의 저작권은 회원
                본인에게 있습니다.
              </li>
              <li>
                회원이 다른 회원의 원작 IP를 기반으로 생성한 2차적 저작물의
                저작권은 2차적 저작물 작성자에게 귀속됩니다. 단, 원작 IP의 이용
                허락 범위 내에서만 권리가 인정되며, 원작자의 저작인격권을
                침해해서는 안 됩니다.
              </li>
              <li>
                IP 확장 프로젝트를 통해 발생한 수익은 프로젝트 시작 시 합의된
                분배 비율(시스템 내 기록)에 따라 정산됩니다.
              </li>
              <li>
                회원은 프로젝트 진행 중 알게 된 미공개 IP 설정, 스토리 등에 대해
                비밀 유지 의무를 가지며, 이를 위반하여 원작자에게 손해를 끼친
                경우 배상 책임을 집니다.
              </li>
              <li>
                회원은 회사가 서비스를 운영하고 개선하기 위해, 그리고{' '}
                <strong>AI 모델을 학습시키고 고도화하기 위한 목적</strong>으로
                회원이 업로드한 콘텐츠를 수집, 저장, 복제, 가공할 수 있는
                권한(비독점적, 전 세계적, 무상 라이선스)을 부여합니다.
              </li>
              <li>
                회사는 회원의 동의 없이 해당 데이터를 제3자에게 판매하거나
                서비스 운영/개선 외의 목적으로 유출하지 않습니다.
              </li>
            </ul>
          </section>

          {/* 제6조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제6조 (계약 해지 및 데이터 보관)
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                회원은 언제든지 서비스 내 설정 메뉴를 통해 이용 계약 해지(회원
                탈퇴)를 신청할 수 있습니다.
              </li>
              <li>
                회사는 회원의 실수로 인한 탈퇴 피해를 방지하기 위해,{' '}
                <strong>탈퇴 요청일로부터 7일간 회원의 데이터를 보관</strong>
                하며, 7일이 경과하면 모든 데이터를 영구 삭제합니다.
              </li>
            </ul>
          </section>

          {/* 제7조 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              제7조 (책임의 제한)
            </h2>
            <p>
              회사는 천재지변, 서버 점검, 통신 장애 등 불가항력적인 사유로
              서비스가 중단될 경우 책임을 지지 않습니다. 또한 서비스에서
              제공하는 분석 결과의 완전성이나 특정 목적에 대한 적합성을 보증하지
              않으며, 이를 바탕으로 한 회원의 주관적 결정에 대해 책임지지
              않습니다.
            </p>
            <p>
              AI 도구를 사용하여 생성된 결과물의 저작권 침해 여부(타인의 저작권
              침해 등)에 대한 법적 책임은 해당 도구를 사용한 회원 본인에게
              있습니다.
            </p>
          </section>

          {/* 하단 안내 */}
          <div className="pt-8 border-t text-center">
            <p className="text-muted-foreground text-xs">
              본 약관은 2026년 1월 21일부터 시행됩니다. <br />
              문의: ipai0917@naver.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
