/**
 * 역사야 놀자 (history.chatgpts.kr) - 대항해 탐험 (Voyage) 스크립트
 * 15세기 리스본에서 인도 캘리컷까지의 신항로 개척 텍스트 기반 역사 학습 게임
 */

(function () {
  'use strict';

  // ============================================================
  // 1. 6대 항해 거점 및 시나리오 데이터
  // ============================================================
  const VOYAGE_STAGES = [
    {
      step: 1,
      id: 'lisbon',
      name: '리스본',
      region: '포르투갈',
      coord: { x: 22, y: 20 },
      sceneTitle: '제1구간: 출항의 도시 리스본 항구',
      sceneDesc: '15세기 후반 포르투갈의 리스본 항구. 엔히크 왕자 이래 오랜 탐험의 결실을 맺기 위해, 당신의 선단은 인도로 가는 미지의 바닷길을 향해 첫 닻을 올립니다. 선원들의 눈빛에는 두려움과 기대가 가득합니다.',
      historyTitle: '리스본과 신항로 개척의 서막',
      historyContent: '포르투갈은 신항로 개척에 가장 앞장선 나라였습니다. 당시 유럽인들은 아시아의 값비싼 향신료(후추, 육두구 등)와 비단을 얻기 위해 오스만 제국을 거치지 않는 새로운 바닷길을 절실히 찾으려 했습니다.',
      choices: [
        {
          text: '식량과 건빵, 절인 고기를 넉넉히 실어 보급을 든든히 한다.',
          effect: { food: 15, durability: 0, morale: 0, fame: 2 },
          log: '선실 깊숙이 마른 건빵과 훈제 고기를 가득 실었습니다. 선원들이 든든해하며 환호합니다!'
        },
        {
          text: '노련한 천문학자와 베테랑 조타수를 고용하여 만반의 준비를 갖춘다.',
          effect: { food: -5, durability: 0, morale: 10, fame: 4 },
          log: '밤하늘의 별자리를 읽는 베테랑 항해사가 합류했습니다. 선원들의 자신감이 크게 올랐습니다!'
        },
        {
          text: '시간을 지체하지 않고 국왕의 기대에 부응하기 위해 신속히 출항한다.',
          effect: { food: -10, durability: -5, morale: -5, fame: 6 },
          log: '빠르게 리스본 항을 빠져나왔습니다. 긴 여정에 앞서 배가 조금 흔들렸지만 출항 소식이 도시에 퍼집니다!'
        }
      ]
    },
    {
      step: 2,
      id: 'canary',
      name: '카나리아 제도',
      region: '대서양 거점 섬',
      coord: { x: 17, y: 34 },
      sceneTitle: '제2구간: 대서양의 쉼터, 카나리아 제도',
      sceneDesc: '넓고 푸른 대서양을 며칠 동안 항해한 끝에 카나리아 제도의 섬들이 수평선 너머로 보입니다. 바닷바람에 지친 선원들이 육지를 보고 환호성을 지릅니다.',
      historyTitle: '대서양 항해의 중간 기착지',
      historyContent: '카나리아 제도와 아조레스 제도는 대서양 항해의 필수적인 중간 기착지로 활용되었습니다. 먼 바다를 오랜 기간 항해하던 배들은 신선한 식수를 얻고 배를 수리하기 위해 섬과 항구를 소중한 거점으로 삼았습니다.',
      choices: [
        {
          text: '섬에 정박하여 선원들에게 신선한 과일과 깨끗한 물을 보급한다.',
          effect: { food: 10, durability: 0, morale: 10, fame: 2 },
          log: '달콤한 과일과 시원한 샘물로 괴혈병 걱정을 덜었습니다. 선원들의 사기가 충천합니다!'
        },
        {
          text: '선창을 비우고 돛과 로프를 꼼꼼히 점검하여 배의 내구도를 높인다.',
          effect: { food: -5, durability: 12, morale: 0, fame: 3 },
          log: '돛대의 균열을 때우고 밧줄을 팽팽하게 당겨 정비했습니다. 배가 한층 더 튼튼해졌습니다.'
        },
        {
          text: '지체 없이 순풍을 타고 곧바로 아프리카 서해안으로 쾌속 항해한다.',
          effect: { food: -8, durability: -5, morale: -5, fame: 6 },
          log: '빠른 속도로 남하하여 시간을 크게 아꼈습니다. 다른 경쟁 탐험대보다 한발 앞서 나갑니다!'
        }
      ]
    },
    {
      step: 3,
      id: 'west_africa',
      name: '아프리카 서해안',
      region: '기니만 & 적도 해역',
      coord: { x: 24, y: 55 },
      sceneTitle: '제3구간: 미지의 바다, 아프리카 서해안',
      sceneDesc: '적도 부근의 뜨거운 태양이 갑판을 내리쬡니다. 바람이 뚝 끊기는 무풍지대와 갑작스러운 열대 스콜(폭풍우)이 번갈아 찾아오며 항해의 난이도가 극에 달합니다.',
      historyTitle: '남쪽으로 이어진 미지의 도전',
      historyContent: '유럽 항해자들은 아프리카 서쪽 해안을 따라 끈질기게 남쪽으로 내려갔습니다. 당시에는 "적도를 넘으면 바다가 끓어오른다"는 미신이 있었지만, 용감한 항해자들은 경험과 지도를 바탕으로 두려움을 극복했습니다.',
      choices: [
        {
          text: '폭풍을 피해 해안선 가까이 안전하게 항로를 유지하며 나아간다.',
          effect: { food: -8, durability: 5, morale: 0, fame: 3 },
          log: '거센 비바람을 피해 침착하게 순항했습니다. 배의 손상을 최소화하며 안전을 지켰습니다.'
        },
        {
          text: '해안의 현지 주민들과 평화롭게 교류하며 물길 정보를 묻는다.',
          effect: { food: 10, durability: 0, morale: 5, fame: 5 },
          log: '친절한 현지 주민들로부터 건조 식량과 물길에 대한 귀중한 조언을 얻었습니다!'
        },
        {
          text: '무풍지대를 뚫기 위해 노를 젓게 하며 강행군을 펼친다.',
          effect: { food: -12, durability: -8, morale: -10, fame: 8 },
          log: '선원들이 땀을 뻘뻘 흘리며 노를 저어 난구간을 돌파했습니다! 빠른 주파로 명성이 높아집니다.'
        }
      ]
    },
    {
      step: 4,
      id: 'cape_good_hope',
      name: '희망봉',
      region: '아프리카 최남단',
      coord: { x: 50, y: 88 },
      sceneTitle: '제4구간: 거센 파도를 넘는 희망봉',
      sceneDesc: '아프리카 대륙의 남쪽 끝에 도달하자 거대한 집채만 한 파도가 뱃전을 강타합니다! 일찍이 바르톨로메우 디아스가 "폭풍의 곶"이라 불렀던 바로 그 험난한 바다입니다.',
      historyTitle: '인도양으로 열린 바닷길, 희망봉',
      historyContent: '아프리카 남단을 돌아 마침내 인도양으로 가는 길이 열렸습니다. 거센 파도로 인해 처음에는 폭풍의 곶이라 불렸으나, 포르투갈 국왕은 "인도로 갈 수 있는 희망을 주었다" 하여 이를 희망봉(Cabo da Boa Esperança)이라 고쳐 불렀습니다.',
      choices: [
        {
          text: '선원들에게 따뜻한 특식을 베풀고 희망을 북돋우며 침착하게 파도를 넘는다.',
          effect: { food: -12, durability: 0, morale: 15, fame: 5 },
          log: '선장의 따뜻한 격려에 선원들이 환호하며 일치단결하여 거센 파도를 헤쳐 나갑니다!'
        },
        {
          text: '파도의 결을 타며 배의 균형을 유지하는 정밀 조타를 펼친다.',
          effect: { food: -6, durability: 8, morale: 5, fame: 6 },
          log: '숙련된 조타술로 암초와 큰 파도를 요리조리 피해 선체를 온전히 보존했습니다.'
        },
        {
          text: '모든 돛을 활짝 펴고 거센 해풍을 정면으로 돌파한다.',
          effect: { food: -8, durability: -12, morale: -5, fame: 10 },
          log: '돛대가 삐걱거릴 정도의 모험 끝에 마침내 아프리카 남단을 돌파했습니다! 역사적 쾌거입니다!'
        }
      ]
    },
    {
      step: 5,
      id: 'east_africa',
      name: '동아프리카 해안',
      region: '모잠비크 & 말린디',
      coord: { x: 65, y: 57 },
      sceneTitle: '제5구간: 인도양 무역망과의 조우, 말린디',
      sceneDesc: '희망봉을 돌아 인도양 북쪽으로 올라오자, 활기찬 항구 도시들이 나타납니다. 다양한 언어와 향신료 냄새, 이국적인 상선들이 드나드는 풍요로운 바다입니다.',
      historyTitle: '이미 번영하고 있던 인도양 무역망',
      historyContent: '인도양 바다에는 유럽인이 오기 훨씬 전부터 아프리카, 아라비아, 인도, 동남아시아의 상인들이 계절풍(몬순)을 이용해 활발하게 교역하고 있었습니다. 바스쿠 다 가마는 이곳 말린디에서 숙련된 아랍인 항해사(이븐 마지드 등)를 만나 인도로 향하는 안전한 길을 안내받았습니다.',
      choices: [
        {
          text: '인도양의 계절풍과 항로를 꿰뚫고 있는 노련한 현지 항해사를 고용한다.',
          effect: { food: -8, durability: 5, morale: 12, fame: 8 },
          log: '인도양의 바람길을 정확히 아는 베테랑 항해사가 길잡이가 되어 주었습니다. 캘리컷이 눈앞입니다!'
        },
        {
          text: '항구 시장에서 인도 향신료 시세와 풍토병 정보를 꼼꼼히 조사한다.',
          effect: { food: 8, durability: 0, morale: 5, fame: 6 },
          log: '시장 상인들로부터 인도 항구의 최신 정세와 알짜 정보를 파악했습니다.'
        },
        {
          text: '선박의 바닥에 달라붙은 따개비를 긁어내고 방수 타르를 칠한다.',
          effect: { food: -5, durability: 14, morale: 0, fame: 4 },
          log: '배 밑바닥을 깔끔히 정비하여 인도양을 횡단할 채비를 완벽하게 끝마쳤습니다!'
        }
      ]
    },
    {
      step: 6,
      id: 'calicut',
      name: '캘리컷',
      region: '인도 남서부',
      coord: { x: 88, y: 36 },
      sceneTitle: '제6구간: 마침내 도달한 향신료의 땅, 인도 캘리컷!',
      sceneDesc: '수평선 너머로 초록빛 야자수와 인도의 캘리컷 해안선이 장엄하게 모습을 드러냅니다! 뱃고동이 울려 퍼지고, 기나긴 탐험 끝에 전 유럽이 염원하던 인도 신항로가 마침내 열렸습니다!',
      historyTitle: '1498년 바스쿠 다 가마의 인도 도착',
      historyContent: '바스쿠 다 가마는 1498년 5월, 오랜 항해 끝에 마침내 인도 캘리컷에 도달했습니다. 이는 유럽에서 아프리카 대륙을 돌아 인도로 가는 바닷길을 처음으로 연 세계사적 대사건이었습니다.',
      choices: [
        {
          text: '캘리컷 영주(자모린)를 예방하고 포르투갈 국왕의 친서와 선물을 전한다.',
          effect: { food: 0, durability: 0, morale: 15, fame: 15 },
          log: '향신료의 본고장 캘리컷에 성공적으로 첫발을 내디뎠습니다! 신항로 개척 대성공!'
        },
        {
          text: '항구에 닻을 내리고 고생한 선원들과 함께 감사의 축배를 든다.',
          effect: { food: 5, durability: 0, morale: 20, fame: 12 },
          log: '머나먼 바다를 건너온 용감한 선원들이 눈물을 흘리며 포옹합니다. 위대한 승리입니다!'
        }
      ]
    }
  ];

  // ============================================================
  // 2. 게임 상태 관리 (State)
  // ============================================================
  const INITIAL_STATE = {
    stepIndex: 0,     // 0 ~ 5
    food: 100,
    durability: 100,
    morale: 80,
    fame: 0,
    isCompleted: false
  };

  let state = Object.assign({}, INITIAL_STATE);

  // ============================================================
  // 3. DOM 요소 참조 캐싱
  // ============================================================
  const el = (id) => document.getElementById(id);

  const dom = {
    // HUD
    currentLocPill: el('voyage-current-loc-pill'),
    stepIndicator: el('voyage-step-indicator'),
    bestScoreVal: el('voyage-best-score-val'),
    valFood: el('val-food'),
    valDurability: el('val-durability'),
    valMorale: el('val-morale'),
    valFame: el('val-fame'),
    barFood: el('bar-food'),
    barDurability: el('bar-durability'),
    barMorale: el('bar-morale'),
    barFame: el('bar-fame'),
    cardFood: el('card-food'),
    cardDurability: el('card-durability'),
    cardMorale: el('card-morale'),
    cardFame: el('card-fame'),

    // 지도 & 배
    ship: el('voyage-ship'),
    mapSvgPassedPath: el('voyage-passed-path'),

    // 상황 & 선택지 카드
    sceneTag: el('voyage-scene-tag'),
    sceneTitle: el('voyage-scene-title'),
    sceneDesc: el('voyage-scene-desc'),
    resultBanner: el('voyage-result-banner'),
    resultTitle: el('voyage-result-title'),
    resultText: el('voyage-result-text'),
    resultDeltas: el('voyage-result-deltas'),
    choicesList: el('voyage-choices-list'),
    nextRow: el('voyage-next-row'),
    nextBtn: el('voyage-next-btn'),

    // 역사 지식 카드
    historyCardTag: el('voyage-history-tag'),
    historyCardTitle: el('voyage-history-title'),
    historyCardText: el('voyage-history-text'),

    // 엔딩 모달
    endingOverlay: el('voyage-ending-overlay'),
    endingFameVal: el('ending-fame-val'),
    endingTitleBadge: el('ending-title-badge'),
    endingFoodVal: el('ending-food-val'),
    endingDurabilityVal: el('ending-durability-val'),
    endingMoraleVal: el('ending-morale-val'),
    endingBestScoreRow: el('ending-best-score-row'),
    restartBtn: el('voyage-restart-btn'),
    heroStartBtn: el('voyage-hero-start-btn')
  };

  // ============================================================
  // 4. 로컬스토리지 최고 점수 관리
  // ============================================================
  const STORAGE_KEY = 'voyage_best_score';

  function getBestScore() {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  function saveBestScore(score) {
    try {
      const current = getBestScore();
      if (score > current) {
        localStorage.setItem(STORAGE_KEY, String(score));
        return true; // 갱신 성공
      }
    } catch (e) {
      /* 무시 */
    }
    return false;
  }

  function updateBestScoreDisplay() {
    const best = getBestScore();
    if (dom.bestScoreVal) {
      dom.bestScoreVal.textContent = best > 0 ? best + '점' : '—';
    }
  }

  // ============================================================
  // 5. 배 위치 및 지도 마커 업데이트
  // ============================================================
  function updateMapUI(stageIndex) {
    const stage = VOYAGE_STAGES[stageIndex];
    if (!stage) return;

    // 배 좌표 이동
    if (dom.ship) {
      dom.ship.style.left = stage.coord.x + '%';
      dom.ship.style.top = stage.coord.y + '%';
    }

    // 각 마커 상태 갱신 (passed, current, future)
    VOYAGE_STAGES.forEach((s, idx) => {
      const markerEl = el('marker-' + s.id);
      if (!markerEl) return;

      markerEl.classList.remove('passed', 'current');
      if (idx < stageIndex) {
        markerEl.classList.add('passed');
      } else if (idx === stageIndex) {
        markerEl.classList.add('current');
      }
    });

    // 지나온 SVG 항로 패스 업데이트 (점진적 채우기 효과)
    if (dom.mapSvgPassedPath) {
      // 0단계(0%)부터 5단계(100%)까지 dashoffset 제어
      const progress = stageIndex / (VOYAGE_STAGES.length - 1);
      const totalLength = 880; // 패스 대략의 길이
      const offset = totalLength * (1 - progress);
      dom.mapSvgPassedPath.style.strokeDashoffset = offset;
    }
  }

  // ============================================================
  // 6. 상태값(HUD) 렌더링
  // ============================================================
  function renderHUD(deltas) {
    // 수치 클램핑 (0 ~ 150)
    state.food = Math.max(0, Math.min(150, state.food));
    state.durability = Math.max(0, Math.min(150, state.durability));
    state.morale = Math.max(0, Math.min(150, state.morale));
    state.fame = Math.max(0, state.fame);

    if (dom.valFood) dom.valFood.textContent = state.food;
    if (dom.valDurability) dom.valDurability.textContent = state.durability;
    if (dom.valMorale) dom.valMorale.textContent = state.morale;
    if (dom.valFame) dom.valFame.textContent = state.fame;

    // 게이지 바 너비 계산
    if (dom.barFood) dom.barFood.style.width = Math.min(100, (state.food / 120) * 100) + '%';
    if (dom.barDurability) dom.barDurability.style.width = Math.min(100, (state.durability / 120) * 100) + '%';
    if (dom.barMorale) dom.barMorale.style.width = Math.min(100, (state.morale / 100) * 100) + '%';
    if (dom.barFame) dom.barFame.style.width = Math.min(100, (state.fame / 50) * 100) + '%';

    // 수치 증감 깜빡임 애니메이션
    if (deltas) {
      flashStatCard(dom.cardFood, deltas.food);
      flashStatCard(dom.cardDurability, deltas.durability);
      flashStatCard(dom.cardMorale, deltas.morale);
      flashStatCard(dom.cardFame, deltas.fame);
    }
  }

  function flashStatCard(cardEl, delta) {
    if (!cardEl || !delta) return;
    const cls = delta > 0 ? 'flash-up' : 'flash-down';
    cardEl.classList.remove('flash-up', 'flash-down');
    void cardEl.offsetWidth; // 트리거 리플로우
    cardEl.classList.add(cls);
    setTimeout(() => cardEl.classList.remove(cls), 650);
  }

  // ============================================================
  // 7. 현재 단계 화면 렌더링
  // ============================================================
  function renderStage(stageIndex) {
    const stage = VOYAGE_STAGES[stageIndex];
    if (!stage) return;

    // 현재 위치 및 인디케이터
    if (dom.currentLocPill) dom.currentLocPill.textContent = stage.name;
    if (dom.stepIndicator) dom.stepIndicator.textContent = `${stage.step} / ${VOYAGE_STAGES.length}`;

    // 지도 갱신
    updateMapUI(stageIndex);

    // 상황 카드
    if (dom.sceneTag) dom.sceneTag.textContent = `항해 ${stage.step}단계 · ${stage.region}`;
    if (dom.sceneTitle) dom.sceneTitle.textContent = stage.sceneTitle;
    if (dom.sceneDesc) dom.sceneDesc.textContent = stage.sceneDesc;

    // 결과 배너 및 다음 버튼 숨김 초기화
    if (dom.resultBanner) dom.resultBanner.classList.remove('show');
    if (dom.nextRow) dom.nextRow.classList.remove('show');

    // 역사 지식 카드 내용 갱신
    if (dom.historyCardTag) dom.historyCardTag.textContent = `역사 탐구 돋보기 · ${stage.name}`;
    if (dom.historyCardTitle) dom.historyCardTitle.textContent = stage.historyTitle;
    if (dom.historyCardText) dom.historyCardText.textContent = stage.historyContent;

    // 선택지 버튼들 동적 렌더링
    renderChoices(stage.choices);
  }

  function renderChoices(choices) {
    if (!dom.choicesList) return;
    dom.choicesList.innerHTML = '';

    choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'voyage-choice-btn';
      btn.innerHTML = `
        <span class="choice-num">${idx + 1}</span>
        <span class="choice-text">${escapeHtml(choice.text)}</span>
        <span class="choice-arrow"><i class="fa-solid fa-chevron-right"></i></span>
      `;

      btn.addEventListener('click', () => onChoiceSelected(choice, btn));
      dom.choicesList.appendChild(btn);
    });
  }

  // ============================================================
  // 8. 선택지 클릭 처리
  // ============================================================
  function onChoiceSelected(choice, chosenBtn) {
    // 모든 선택지 비활성화 (중복 클릭 방지)
    const allBtns = dom.choicesList.querySelectorAll('.voyage-choice-btn');
    allBtns.forEach(b => {
      b.disabled = true;
      b.classList.remove('selected');
    });
    chosenBtn.classList.add('selected');

    // 능력치 적용
    state.food += choice.effect.food || 0;
    state.durability += choice.effect.durability || 0;
    state.morale += choice.effect.morale || 0;
    state.fame += choice.effect.fame || 0;

    // HUD 갱신
    renderHUD(choice.effect);

    // 결과 배너 표시
    if (dom.resultBanner) {
      dom.resultBanner.classList.add('show');
      if (dom.resultTitle) dom.resultTitle.textContent = '선장의 결단과 결과';
      if (dom.resultText) dom.resultText.textContent = choice.log;

      // 델타 알약 태그들 생성
      if (dom.resultDeltas) {
        dom.resultDeltas.innerHTML = '';
        appendDeltaPill('식량', choice.effect.food);
        appendDeltaPill('배 내구도', choice.effect.durability);
        appendDeltaPill('선원 사기', choice.effect.morale);
        appendDeltaPill('명성', choice.effect.fame);
      }
    }

    // 다음 단계 버튼 표시
    const isLastStage = state.stepIndex >= VOYAGE_STAGES.length - 1;
    if (dom.nextRow && dom.nextBtn) {
      dom.nextRow.classList.add('show');
      dom.nextBtn.innerHTML = isLastStage 
        ? '<i class="fa-solid fa-award"></i> 항해 성공! 최종 결과 보기' 
        : '<i class="fa-solid fa-arrow-right"></i> 다음 항해지로 이동';
    }
  }

  function appendDeltaPill(name, delta) {
    if (delta === 0 || delta === undefined) return;
    const pill = document.createElement('span');
    const isPos = delta > 0;
    pill.className = `delta-pill ${isPos ? 'delta-positive' : 'delta-negative'}`;
    pill.textContent = `${name} ${isPos ? '+' : ''}${delta}`;
    dom.resultDeltas.appendChild(pill);
  }

  // ============================================================
  // 9. 다음 단계 이동 및 엔딩
  // ============================================================
  function goToNextStage() {
    if (state.stepIndex < VOYAGE_STAGES.length - 1) {
      state.stepIndex += 1;
      renderStage(state.stepIndex);

      // 모바일 등에서 시선이 너무 아래에 머물지 않도록 상태 카드로 부드럽게 스크롤
      const mapEl = el('voyage-hud-area');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // 캘리컷 도달 후 최종 완료
      showEnding();
    }
  }

  function showEnding() {
    state.isCompleted = true;

    // 최고 점수 갱신 확인
    const prevBest = getBestScore();
    const isNewRecord = saveBestScore(state.fame);
    updateBestScoreDisplay();

    // 칭호 계산 (명성 기반)
    let titleBadge = '용감한 신항로 개척자';
    if (state.fame >= 35) {
      titleBadge = '👑 전설의 대제독 (Admiral)';
    } else if (state.fame >= 25) {
      titleBadge = '⭐ 노련한 대양의 탐험 선장';
    } else if (state.fame >= 15) {
      titleBadge = '⛵ 의지의 바다 탐험가';
    }

    if (dom.endingFameVal) dom.endingFameVal.textContent = state.fame + '점';
    if (dom.endingTitleBadge) dom.endingTitleBadge.textContent = titleBadge;
    if (dom.endingFoodVal) dom.endingFoodVal.textContent = state.food;
    if (dom.endingDurabilityVal) dom.endingDurabilityVal.textContent = state.durability;
    if (dom.endingMoraleVal) dom.endingMoraleVal.textContent = state.morale;

    if (dom.endingBestScoreRow) {
      dom.endingBestScoreRow.innerHTML = isNewRecord
        ? '<span style="color:#059669;font-weight:900;">🎉 축하합니다! 새로운 최고 기록을 달성했습니다!</span>'
        : `이전 최고 명성: <strong>${prevBest}점</strong>`;
    }

    if (dom.endingOverlay) {
      dom.endingOverlay.classList.add('show');
    }
  }

  function restartGame() {
    state = Object.assign({}, INITIAL_STATE);
    if (dom.endingOverlay) dom.endingOverlay.classList.remove('show');
    renderHUD();
    renderStage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // ============================================================
  // 10. 초기화 및 이벤트 바인딩
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    updateBestScoreDisplay();
    renderHUD();
    renderStage(0);

    // 다음 단계 버튼
    if (dom.nextBtn) {
      dom.nextBtn.addEventListener('click', goToNextStage);
    }

    // 다시 하기 버튼
    if (dom.restartBtn) {
      dom.restartBtn.addEventListener('click', restartGame);
    }

    // 상단 히어로 탐험 시작 버튼
    if (dom.heroStartBtn) {
      dom.heroStartBtn.addEventListener('click', () => {
        const hudEl = el('voyage-hud-area');
        if (hudEl) hudEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });

})();
