
/* jshint esnext: true */

const setPage = (page) => {

  const $pages = $('.pages .page').hide();
  const $page = $pages.filter('.' + page);
  $page.show();

  if ($page.hasClass('page-blue')) {
    $(document.body).addClass('background-blue');
    $('.game-steps').hide();
  } else {
    $(document.body).removeClass('background-blue');
    $('.game-steps').show();
  }

};

const numbers = ['aucune', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];

let points = 0;
let maxPoints = 0;

$('.start-action, .continue-action').on('click', (e) => {
  e.preventDefault();
  setPage('page-select');
  points = 0;
  maxPoints = 0;
});

$('.share-img').on('click', (e) => {
  e.preventDefault();
  const text = "J'ai fais " + points + " points sur " + maxPoints + " ! Test tes connaissances en politique:";
  const url = location.href;
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
});

$('.navbar-brand').on('click', (e) => {
  e.preventDefault();
  setPage('page-start');
});

// START !
setPage('page-start');

window.jsonp_response = (data) => {

  const $game = $('.card-game');
  const $tpl = $('.game-template [data-template="card"]');
  const $gameSubmit = $('.btn-game-submit');
  const $gameTask = $('.game-task');
  const $gameSteps = $('.game-steps');
  const $flashNextStep = $('.flash-next-step');
  const $themeList = $('.theme-list');

  let i = 0;
  const $selectLeft = $('.select-choice .select-left');
  const $selectRight = $('.select-choice .select-right');
  $.each(data.themes, (index, item) => {
    const $li = $('<li></li>').text(item.label);
    $li.attr('data-theme', index);
    $themeList.append($li);

    (i++ % 2 ? $selectLeft : $selectRight).append(
      $('<li></li>').append(
        $('<a></a>').addClass('choice').data('choice', index).text(item.label).on('click', (e) => {
          e.preventDefault();
          setPage('page-game');
          setupGame('environnement_ecologie', 0);
        })
      )
    );
  });

  $('.choice-random').on('click', (e) => {
    e.preventDefault();
    setPage('page-game');
    setupGame('environnement_ecologie', 0);
  });

  const setupGame = (theme, step) => {

    const stepData = data.themes[theme].steps[step];
    const stepsLength = data.themes[theme].steps.length;

    const slots = [];
    const programs = [];

    $themeList.find('.active').removeClass('active');
    $themeList.find('[data-theme="' + theme + '"]').addClass('active');
    $gameSteps.empty();
    $gameTask.show();

    for (let i = 0; i < stepsLength; i++) {
      const $a = $('<a></a>').attr('href', '#').text('Étape ' + (i+1));
      $a.on('click', e => e.preventDefault());

      const $li = $('<li></li>').append($a);
      if (step === i) $li.addClass('active');

      $gameSteps.append($li);
    }

    $game.empty();

    $.each(stepData.candidates, (index, item) => {
      const $tmp = $tpl.clone();
      $tmp.find('.card-title').text(item.label);
      $tmp.find('.card-thumbnail').attr('src', item.img);
      slots.push($tmp);
      programs.push({
        title: item.program.title,
        content: item.program.content,
        slot: $tmp
      });
      $tmp.appendTo($game);
    });

    $.each(slots, (index, slot) => {
      const program = programs.splice(Math.floor(Math.random() * programs.length), 1)[0];
      slot.find('.card-program').data('correct-parent', program.slot);

      const slotText = slot.find('.card-text');
      slotText.append($('<h5></h5>').text(program.title));
      $.each(program.content, (index, item) => {
        slotText.append($('<p></p>').text(item));
      });
    });

    const $candidates = $game.find('.card-candidate');
    const $programs = $game.find('.card-program');

    let maxHeight = 0;

    $programs.each((index, item) => {
      $(item).data('original-parent', $(item).parent());
      const height = $(item).outerHeight();
      if (height > maxHeight) maxHeight = height;
    });

    $programs.each((index, item) => {
      $(item).find('.card-program-inner').outerHeight(maxHeight);
    });

    const draggs = Draggable.create('.card-game .card-program', {
      type: 'x,y',
      onDragStart: function (e) {
        const $item = $(this.target);
        if ($item.hasClass('card-program') && $item.parent().hasClass('card-candidate')) {
          $item.parent().removeClass('card-filled');
        }
      },
      onDrag: function (e) {
        $candidates.each((index, item) => {
         if (Draggable.hitTest(item, e) && item !== this.target) {
           $(item).addClass('card-drag-hover');
         } else {
           $(item).removeClass('card-drag-hover');
         }
        });
      },
      onDragEnd: function(e) {
        let $candidate = false;
        let $program = $(this.target);

        $candidates.each((index, item) => {
          if (!$candidate && Draggable.hitTest(item, e) && item !== this.target && !$(item).hasClass('card-filled')) {
            $candidate = $(item);
          }
          $(item).removeClass('card-drag-hover');
        });

        if ($candidate) {
          $candidate.append($program);
          $candidate.addClass('card-filled');
          TweenLite.set($program, { clearProps:"all" });
        } else {
          if ($program.parent().hasClass('card-candidate')) {
            $program.parent().removeClass('card-filled');
            $program.appendTo($program.data('original-parent'));
          }
          TweenLite.set($program, { clearProps:"all" });
        }

        if (!$candidates.filter(':not(.card-filled)').length) {

          $.each(draggs, (index, item) => item.kill());
          $gameTask.hide();

          $candidates.each((index, item) => {
            const $candidate = $(item);
            const $program = $candidate.find('.card-program');
            const $currentParent = $candidate.closest('.card-slot');
            const $correctParent = $program.data('correct-parent');

            $program.appendTo($program.data('correct-parent'));
            maxPoints++;

            if ($currentParent.is($correctParent)) {
              $candidate.addClass('card-state-success');
              points++;
            } else {
              $candidate.addClass('card-state-error');
            }

          });

          if (step < stepsLength - 1) {
            $flashNextStep.find('.flash-action-message').text('Passer à l’étape ' + (step + 2));
            $flashNextStep.find('a').one('click', (e) => {
              e.preventDefault();
              $flashNextStep.hide();
              setupGame(theme, step + 1);
            });
          } else {
            $flashNextStep.find('.flash-action-message').text('Continuer');
            $flashNextStep.find('a').one('click', (e) => {
              e.preventDefault();
              $flashNextStep.hide();

              $('.points-count').empty().append([
                $('<span></span>').text('Vous totalisez '),
                $('<span></span>').addClass('text-highlight').text(points),
                $('<span></span>').text(points >= 2 ? ' points sur ' : 'point sur ').append(maxPoints),
              ]);

              setPage('page-points');
            });
          }

          const flashMsg = ['Vous avez obtenu'];

          if (points >= numbers.length) {
            flashMsg.push(points.toString());
          } else {
            flashMsg.push(numbers[points]);
          }

          if (points >= 2) {
            flashMsg.push('bonnes réponses sur');
          } else {
            flashMsg.push('bonne réponse sur');
          }

          if (maxPoints >= numbers.length) {
            flashMsg.push(maxPoints.toString());
          } else {
            flashMsg.push(numbers[maxPoints]);
          }

          $flashNextStep.find('.flash-text').text(flashMsg.join(' '));
          $flashNextStep.show();

        }
      },
    });

  };
};
