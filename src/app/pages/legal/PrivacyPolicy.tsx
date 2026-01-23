import { Button } from '../../components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../../components/ui/theme-toggle';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
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

        {/* 제목 */}
        <div className="flex items-center gap-3 mb-6 border-b pb-6 text-foreground">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            개인정보처리방침
          </h1>
        </div>

        {/* 본문 컨텐츠 */}
        <div className="space-y-8 text-sm md:text-base leading-relaxed text-foreground">
          <section className="space-y-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              최종 업데이트: 2026년 1월 21일
            </p>
            <p>
              IP.AI(이하 &quot;회사&quot;)는 사용자의 개인정보를 소중하게
              생각하며, 「개인정보 보호법」을 준수합니다. 본 방침은 귀하가
              제공하는 개인정보가 어떤 용도로 처리되는지 투명하게 공개하기 위해
              작성되었습니다.
            </p>
          </section>

          {/* 1. 수집 항목 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              1. 수집하는 개인정보 항목
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>이메일 인증 및 가입</strong>: 이메일 주소,{' '}
                  <strong>이메일 인증코드 및 인증 기록</strong>,
                  비밀번호(암호화), 이름, 휴대전화번호
                </li>
                <li>
                  <strong>네이버 로그인 연동</strong>: 네이버 식별자(ID), 이름,
                  성별, 생년월일, 휴대전화번호, 이메일 주소
                </li>
                <li>
                  <strong>자동 수집</strong>: 서비스 이용 기록, 접속 로그, IP
                  주소
                </li>
              </ul>
            </div>
          </section>

          {/* 2. 이용 목적 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              2. 개인정보의 이용 목적
            </h2>
            <p>회사는 다음의 목적을 위해서만 개인정보를 처리합니다.</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>이메일 본인 확인 및 인증 코드 발송</strong>
              </li>
              <li>회원 식별 및 가입 의사 확인</li>
              <li>IP 분석 및 설정집 자동 추출 서비스 제공</li>
              <li>불량 회원의 부정 이용 방지</li>
            </ul>
          </section>

          {/* 3. 보유 및 파기 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              3. 개인정보의 보유 및 파기
            </h2>
            <p>
              회사는 목적 달성 시 정보를 즉시 파기하는 것을 원칙으로 합니다.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
              <li>
                <strong>
                  이메일 인증번호: 인증 성공 시 또는 유효시간(5분) 만료 시 즉시
                  삭제
                </strong>
              </li>
              <li>회원 정보: 회원 탈퇴 시 즉시 삭제</li>
              <li>
                법령 준수: 관련 법령에 명시된 보존 기간(접속로그 3개월 등)을
                준수
              </li>
            </ul>
          </section>

          {/* 4. 위탁 및 제3자 제공 (현재 클라우드 안 쓰는 상태 반영) */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              4. 개인정보의 위탁 및 제3자 제공
            </h2>
            <p className="text-muted-foreground italic">
              회사는 현재 외부 업체에 개인정보 처리를 위탁하지 않으며, 이용자의
              동의 없이 개인정보를 제3자에게 제공하지 않습니다. (추후 클라우드
              인프라 활용 등 위탁 발생 시 본 방침을 통해 고지하겠습니다.)
            </p>
          </section>

          {/* 5. 담당자 연락처 */}
          <section className="space-y-3">
            <h2 className="text-base md:text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full" />
              5. 개인정보 보호책임자
            </h2>
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
              <ul className="text-sm space-y-1">
                <li>• 책임자: IP.AI 팀</li>
                <li>
                  • 문의처:{' '}
                  <span className="font-semibold text-blue-600">
                    ipai0917@naver.com
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <p className="text-center text-muted-foreground text-xs pt-8 border-t">
            본 방침은 2026년 1월 21일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
