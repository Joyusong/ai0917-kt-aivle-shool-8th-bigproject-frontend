import {
  Brain,
  Users,
  Globe,
  ArrowRight,
  Menu,
  X,
  BookMarked,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { Link } from 'react-router-dom';

interface LandingPageProps {
  onSignInClick: () => void;
}

export function LandingPage({ onSignInClick }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background min-h-screen transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className="bg-card border-b border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-foreground text-lg font-semibold">
                IPSUM
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-foreground hover:text-muted-foreground transition-colors text-sm"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-foreground hover:text-muted-foreground transition-colors text-sm"
              >
                Pricing
              </a>
              <a
                href="#about"
                className="text-foreground hover:text-muted-foreground transition-colors text-sm"
              >
                About
              </a>
            </div>

            {/* Desktop Right Side - Dark Mode Toggle + CTA */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Button
                onClick={onSignInClick}
                variant="outline"
                className="border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all h-10 px-6 rounded-lg"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border transition-colors duration-300">
              <div className="flex flex-col gap-4">
                <a
                  href="#features"
                  className="text-foreground hover:text-muted-foreground transition-colors text-sm"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-foreground hover:text-muted-foreground transition-colors text-sm"
                >
                  Pricing
                </a>
                <a
                  href="#about"
                  className="text-foreground hover:text-muted-foreground transition-colors text-sm"
                >
                  About
                </a>
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 flex justify-center">
                    <ThemeToggle />
                  </div>
                </div>
                <Button
                  onClick={onSignInClick}
                  variant="outline"
                  className="border-border text-foreground hover:bg-accent transition-all h-10 rounded-lg"
                >
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
              서사를 데이터로,
              <br />
              IP의 가치를
              <br />
              증명하세요
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-8 text-lg md:text-xl">
              AI 기반 설정집 자동 추출과 IP 확장 시뮬레이션으로 창작물의 가치를
              체계적으로 관리하고 증명합니다.
            </p>
            <div className="flex items-center gap-4">
              <Button
                onClick={onSignInClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-lg"
              >
                시작하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="text-foreground hover:bg-muted h-12 px-8 rounded-lg"
              >
                데모 보기
              </Button>
            </div>
          </div>

          {/* Right: Wireframe UI Mockup */}
          <div className="relative">
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
              {/* Mockup Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                <div className="w-3 h-3 rounded-full bg-muted"></div>
                <div className="w-3 h-3 rounded-full bg-muted"></div>
              </div>

              {/* Mockup Content */}
              <div className="space-y-6">
                <div className="h-4 bg-primary rounded w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-3 bg-muted rounded w-4/6"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="h-24 bg-muted/50 border border-border rounded-lg"></div>
                  <div className="h-24 bg-muted/50 border border-border rounded-lg"></div>
                  <div className="h-24 bg-muted/50 border border-border rounded-lg"></div>
                </div>
              </div>
            </div>

            {/* Floating Card */}
            <div className="absolute -right-4 -bottom-4 bg-card border border-border rounded-lg p-4 shadow-sm w-48">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="h-2 bg-muted rounded w-16 mb-1"></div>
                  <div className="h-2 bg-muted rounded w-12"></div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded w-full mb-2"></div>
              <div className="h-2 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-4">
            핵심 기능
          </h2>
          <p className="text-lg text-muted-foreground">
            AI가 창작물을 분석하고 체계화합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-xl text-foreground mb-3">인물 설정 자동화</h3>
            <p className="text-muted-foreground leading-[1.6]">
              캐릭터 프로필, 관계도, 핵심 욕망을 AI가 자동으로 추출하고
              체계화합니다.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-xl text-foreground mb-3">세계관 동기화</h3>
            <p className="text-muted-foreground leading-[1.6]">
              시간, 공간, 시스템 규칙을 명확하게 정의하고 설정 간 충돌을
              실시간으로 감지합니다.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="w-12 h-12 border border-border rounded-lg flex items-center justify-center mb-6">
              <BookMarked className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-xl text-foreground mb-3">
              2차 창작 시뮬레이션
            </h3>
            <p className="text-muted-foreground leading-[1.6]">
              영화, 드라마, 웹툰 등 다양한 매체로의 확장 가능성을 AI가 분석하고
              제안합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wider">
            Trusted by
          </p>
          <div className="flex items-center justify-center gap-16 flex-wrap">
            {/* Logo placeholders */}
            <div className="text-muted-foreground text-2xl font-semibold opacity-40">
              Company A
            </div>
            <div className="text-muted-foreground text-2xl font-semibold opacity-40">
              Company B
            </div>
            <div className="text-muted-foreground text-2xl font-semibold opacity-40">
              Company C
            </div>
            <div className="text-muted-foreground text-2xl font-semibold opacity-40">
              Company D
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground mb-4">
            합리적인 가격
          </h2>
          <p className="text-lg text-muted-foreground">
            창작 규모에 맞는 요금제를 선택하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="mb-8">
              <h3 className="text-2xl text-foreground mb-2">Just IPSUM</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl md:text-5xl text-foreground">₩0</span>
                <span className="text-muted-foreground">/월</span>
              </div>
              <p className="text-muted-foreground">시작하는 창작자를 위한</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                </div>
                <span className="text-foreground">월 10,000 토큰</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                </div>
                <span className="text-foreground">최대 3개 작품</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-foreground rounded-full"></div>
                </div>
                <span className="text-foreground">기본 템플릿</span>
              </li>
            </ul>

            <Button
              onClick={onSignInClick}
              variant="outline"
              className="w-full border-border hover:bg-accent h-12 rounded-lg"
            >
              무료로 시작하기
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-primary border border-primary rounded-lg p-8 relative">
            <div className="absolute -top-3 left-8 bg-card border border-border px-3 py-1 rounded-full text-xs text-foreground">
              추천
            </div>

            <div className="mb-8">
              <h3 className="text-2xl text-primary-foreground mb-2">
                IPSUM More
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl md:text-5xl text-primary-foreground">
                  ₩19,900
                </span>
                <span className="text-primary-foreground/70">/월</span>
              </div>
              <p className="text-primary-foreground/70">
                본격적인 창작 활동을 위한
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <span className="text-primary-foreground">무제한 토큰</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <span className="text-primary-foreground">무제한 작품</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <span className="text-primary-foreground">프리미엄 템플릿</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <span className="text-primary-foreground">설정 충돌 감지</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                </div>
                <span className="text-primary-foreground">AI 분석 리포트</span>
              </li>
            </ul>

            <Button
              onClick={onSignInClick}
              className="w-full bg-card text-foreground hover:bg-accent h-12 rounded-lg"
            >
              진짜로 시작하기
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-foreground text-lg font-semibold">
                IPSUM
              </span>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                이용약관
              </Link>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                개인정보처리방침
              </Link>
              <a href="#" className="hover:text-foreground transition-colors">
                고객센터
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 IPSUM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
