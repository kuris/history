/* ============================================================
   역사야 놀자! - 내 학습 이력 패널 (history-recent.js)

   [이 파일이 하는 일]
     로그인한 사용자에게 "최근 학습한 시대"와 "최근 푼 문제"를 보여 줍니다.
     데이터는 이미 public.study_progress / public.quiz_attempts 에 쌓이고 있어
     읽어서 보여 주기만 합니다. 저장 로직은 script.js 그대로입니다.

   [비로그인 사용자]
     서버 호출 없음. 연표·한국사·세계사·퀴즈·프린트는 지금과 100% 동일합니다.

   의존성: cg-auth.js (window.CGAuth)
   ============================================================ */

(function () {
  'use strict';

  function CG() { return window.CGAuth || null; }

  function mount() {
    if (!CG() || !CGAuth.mountRecentPanel) return;

    var host = document.getElementById('history-recent');
    if (host) {
      CGAuth.mountRecentPanel(host, {
        title: '📜 최근 학습한 시대',
        moreUrl: 'login.html',
        guestText: 'Google 로그인하면 학습한 시대와 퀴즈 기록이 계정에 저장돼, 휴대폰에서 공부하고 PC에서 이어서 볼 수 있어요.',
        emptyText: '아직 학습 기록이 없어요. 연표나 한국사를 읽으면 여기에 쌓입니다.',
        loader: async function () {
          var rows = await CGAuth.listHistory('study_progress', {
            orderBy: 'completed_at', limit: 8
          });
          return rows.map(function (r) {
            return { title: r.period, url: 'korea.html', updated_at: r.completed_at };
          });
        }
      });
    }

    var quizHost = document.getElementById('history-recent-quiz');
    if (quizHost) {
      CGAuth.mountRecentPanel(quizHost, {
        title: '🎯 최근 푼 문제',
        moreUrl: 'login.html',
        guestText: 'Google 로그인하면 퀴즈 정답·오답이 계정에 보관돼 오답노트로 다시 볼 수 있어요.',
        emptyText: '아직 푼 문제가 없어요. 역사 퀴즈를 한 번 풀어 보세요.',
        loader: async function () {
          var rows = await CGAuth.listHistory('quiz_attempts', {
            orderBy: 'answered_at', limit: 8
          });
          return rows.map(function (r) {
            return {
              title: (r.source === 'exam' ? '기출변형' : '역사 퀴즈') + ' · ' + r.question_id,
              subtitle: r.is_correct ? '정답' : '오답',
              url: r.source === 'exam' ? 'exam.html' : 'quiz.html',
              updated_at: r.answered_at
            };
          });
        }
      });
    }
  }

  function start() { if (CG()) mount(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
