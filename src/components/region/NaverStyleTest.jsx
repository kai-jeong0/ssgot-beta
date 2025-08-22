import React from 'react';
import NaverStyleRegionPicker from './NaverStyleRegionPicker';

/**
 * 네이버 스타일 지역 선택 컴포넌트 테스트 페이지
 */
function NaverStyleTest() {
  const handleRegionSelect = (selection) => {
    console.log('✅ 지역 선택 완료:', selection);
    alert(`선택완료!\n\n경기도 > ${selection.sig.name} > ${selection.emd.name}\n\n콘솔에서 자세한 정보를 확인하세요.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">🗺️ 네이버 스타일 지역 선택 테스트</h1>
          <p className="text-gray-600 mt-1">경기도 시·군 → 읍/면/동 지도 기반 선택 UI</p>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto h-screen">
        <NaverStyleRegionPicker 
          initialProvince="경기도"
          onSelect={handleRegionSelect}
          className="h-full"
        />
      </div>

      {/* 사용법 가이드 */}
      <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
        <h3 className="font-semibold text-gray-900 mb-2">🎯 사용법</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 지도에서 시·군 클릭 → 읍면동 보기</li>
          <li>• 읍면동 클릭 → 선택 완료</li>
          <li>• 브레드크럼으로 상위 단계 이동</li>
          <li>• 드롭다운에서 직접 선택 가능</li>
          <li>• 미니맵 클릭으로 지도 이동</li>
        </ul>
      </div>
    </div>
  );
}

export default NaverStyleTest;
