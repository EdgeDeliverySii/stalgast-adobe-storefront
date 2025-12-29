import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

export default async function decorate(block) {
  // check location
  const navbarExcludedPaths = ['/customer', '/checkout'];
  if(navbarExcludedPaths.some((url) => window.location.pathname.includes(url))) return;

  // load navbar as fragment
  const navbarMeta = getMetadata('navbar-custom');
  const navbarPath = navbarMeta ? new URL(navbarMeta, window.location).pathname : '/navbar-custom';
  const fragment = await loadFragment(navbarPath);

  // clear block inner text
  block.textContent = '';

  const root = fragment.querySelector('ul');
  if (!root) return;

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

  // main function for creating and processing dropdowns
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

      if (li === root.children[1]) {
        li.classList.add('nb-item-tiles');
        childUl.classList.add('nb-submenu-tiles');
      }

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
          closeItem(li);
        }, 150);
      });

      li.addEventListener('focusin', () => openItem(li));
      li.addEventListener('focusout', (e) => {
        if (!li.contains(e.relatedTarget)) closeItem(li);
      });

      if (control) {
        control.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') {
            childUl.querySelector('a, span')?.focus();
            e.preventDefault();
          }
          if (e.key === 'Escape') {
            closeItem(li);
            control.focus();
          }
        });
      }

      process(childUl, level + 1);
    });
  }

  // decorate navbar-custom DOM 
  root.classList.add('nb-root');

  const navBarContainer = document.createElement('div');
  navBarContainer.classList.add('navbar');
  navBarContainer.append(root);

  block.append(navBarContainer);

  const parentDiv = navBarContainer.closest(".navbar-custom");
  if(parentDiv){
    parentDiv.classList.add("navbar-wrapper");
  }

  process(root);
}
