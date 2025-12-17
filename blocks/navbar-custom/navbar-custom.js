export default function decorate(block) {
  const root = block.querySelector('ul');
  if (!root) return;

  const firstItem = root.querySelector(':scope > li');
  const isMainPage = window.location.pathname === '/' ? true : false;

  // helper functions
  const setExpanded = (el, state) =>
    el?.setAttribute('aria-expanded', String(state));

  const openItem = (li) => {
    li.classList.add('open');
    setExpanded(li.querySelector('.nb-link, .nb-label'), true);
  };

  const closeItem = (li) => {
    li.classList.remove('open');
    setExpanded(li.querySelector('.nb-link, .nb-label'), false);
  };

  // main function for processing dropdowns
  function process(list, level = 1) {
    [...list.children].forEach((li) => {
      li.classList.add('nb-item', `nb-level-${level}`);

      let control = li.querySelector(':scope > a');

      if (control) {
        control.classList.add('nb-link');
      } else if (li.firstChild?.nodeType === Node.TEXT_NODE) {
        const span = document.createElement('span');
        span.textContent = li.firstChild.textContent.trim();
        span.className = 'nb-link nb-label';
        li.replaceChild(span, li.firstChild);
        control = span;
      }

      const childUl = li.querySelector(':scope > ul');
      if (!childUl) return;

      li.classList.add('has-children');
      childUl.classList.add('nb-submenu');

      if (control) {
        control.setAttribute('role', 'button');
        control.setAttribute('aria-haspopup', 'true');
        setExpanded(control, false);
      }

      let closeTimer;

      li.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        openItem(li);
      });
      li.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
          if (isMainPage) {
            if (li !== firstItem) closeItem(li);
          } else {
            closeItem(li);
          }
        }, 150);
      });

      li.addEventListener('focusin', () => openItem(li));
      li.addEventListener('focusout', (e) => {
        if(isMainPage){
          if(!li.contains(e.relatedTarget) && li !== firstItem) closeItem(li);
        }
        else {
          if (!li.contains(e.relatedTarget)) closeItem(li);
        }
      });

      if (control) {
        control.addEventListener('click', (e) => {
          e.preventDefault();
          li.classList.toggle('open');
          setExpanded(control, li.classList.contains('open'));
        });

        control.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            childUl.querySelector('a, span')?.focus();
            e.preventDefault();
          }
          if (e.key === 'Escape') {
            if(isMainPage){
              if(li !== firstItem) closeItem(li);
            }
            else {
              closeItem(li);
            }
            control.focus();
          }
        });
      }

      process(childUl, level + 1);
    });
  }

  block.classList.add('navbar');
  root.classList.add('nb-root');

  process(root);

  if (isMainPage && firstItem?.classList.contains('has-children')) {
    openItem(firstItem);
  }
}
