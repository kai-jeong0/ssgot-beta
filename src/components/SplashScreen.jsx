import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const fullText = '쓰곳';
  const subtitleText = '지역화폐 쓰는 곳';

  useEffect(() => {
    // 1단계: 타이핑 애니메이션
    const timer1 = setTimeout(() => {
      setIsTyping(true);
      setAnimationPhase(1);
    }, 500);

    // 2단계: 타이핑 완료 후 서브타이틀 표시
    const timer2 = setTimeout(() => {
      setIsTyping(false);
      setShowSubtitle(true);
      setAnimationPhase(2);
    }, 2000);

    // 3단계: 버튼 표시
    const timer3 = setTimeout(() => {
      setShowButton(true);
      setAnimationPhase(3);
    }, 3000);

    // 4단계: 자동 전환 (5초 후)
    const timer4 = setTimeout(() => {
      handleComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // 타이핑 애니메이션
  useEffect(() => {
    if (!isTyping) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isTyping]);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleClick = () => {
    handleComplete();
  };

  // 터치/클릭 이벤트로 스킵 가능
  const handleSkip = () => {
    if (animationPhase >= 2) { // 서브타이틀이 표시된 후에만 스킵 가능
      handleComplete();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center z-50"
      onClick={handleSkip}
    >
      <div className="text-center px-4 max-w-md mx-auto">
        {/* 메인 로고 영역 */}
        <div className="mb-8">
          <div className="relative">
            {/* 타이핑 애니메이션 */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-4 relative">
              {typedText}
              {isTyping && (
                <span className="animate-pulse text-orange-500">|</span>
              )}
            </h1>
            
            {/* 서브타이틀 */}
            {showSubtitle && (
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in">
                {subtitleText}
              </p>
            )}
          </div>
        </div>

        {/* 인터랙티브 요소들 */}
        <div className="space-y-6">
          {/* 플로팅 아이콘들 */}
          <div className="flex justify-center space-x-4 sm:space-x-6 md:space-x-8">
            {['💰', '🏪', '📍', '🎯'].map((emoji, index) => (
              <div
                key={index}
                className={`text-2xl sm:text-3xl md:text-4xl transform transition-all duration-1000 ${
                  animationPhase >= 1 ? 'animate-bounce' : 'opacity-0 scale-50'
                }`}
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationIterationCount: 2
                }}
              >
                {emoji}
              </div>
            ))}
          </div>

          {/* 시작 버튼 */}
          {showButton && (
            <button
              onClick={handleClick}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg md:text-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 active:scale-95"
            >
              시작하기
            </button>
          )}

          {/* 스킵 안내 */}
          {animationPhase >= 2 && (
            <p className="text-xs text-gray-400 mt-4 animate-fade-in">
              화면을 터치하면 건너뛸 수 있습니다
            </p>
          )}

          {/* 로딩 인디케이터 */}
          <div className="mt-6 sm:mt-8">
            <div className="w-24 sm:w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-5000 ease-out"
                style={{
                  width: `${(animationPhase / 3) * 100}%`
                }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {animationPhase === 0 && '준비 중...'}
              {animationPhase === 1 && '로딩 중...'}
              {animationPhase === 2 && '거의 완료...'}
              {animationPhase === 3 && '준비 완료!'}
            </p>
          </div>
        </div>

        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* 상단 장식 */}
          <div className="absolute top-6 sm:top-10 left-6 sm:left-10 w-16 sm:w-20 h-16 sm:h-20 bg-orange-200 rounded-full opacity-20 animate-pulse" />
          <div className="absolute top-16 sm:top-20 right-6 sm:right-20 w-12 sm:w-16 h-12 sm:h-16 bg-orange-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* 하단 장식 */}
          <div className="absolute bottom-16 sm:bottom-20 left-6 sm:left-20 w-20 sm:w-24 h-20 sm:h-24 bg-orange-100 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-10 w-10 sm:w-12 h-10 sm:h-12 bg-orange-200 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
