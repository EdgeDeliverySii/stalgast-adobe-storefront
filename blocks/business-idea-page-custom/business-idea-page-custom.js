function decorateContent(contentContainer){
  if(contentContainer){
    contentContainer.querySelectorAll('li').forEach((li) => {
      if(li.querySelector('a')){
        li.classList.add('business-idea-linked-list-item');
      }
    })

    const mainTitle = contentContainer.querySelector('h1');
    if(mainTitle){
      mainTitle.classList.add('business-idea-title');
      return;
    }
    
    const paragraph = contentContainer.querySelector('p');
    if(paragraph && contentContainer.dataset.align === 'right'){
      paragraph.classList.add('business-idea-paragraph-highlight');
      return;
    }

    const pictures = contentContainer.querySelectorAll('picture');
    if(pictures.length > 1){
      const picturesContainer = contentContainer.querySelector('p');
      picturesContainer.classList.add('business-idea-pictures-grid');
      
      pictures.forEach((picture) => picture.classList.add('business-idea-picture'));

      return;
    } else if(pictures.length === 1){
      pictures[0].classList.add('business-idea-picture');
      return;
    }

    const subtitle = contentContainer.querySelector('h2');
    if(subtitle){
      subtitle.classList.add('business-idea-subtitle');
      return;
    }
  }
}

export default async function decorate(block) {
  const contentWrappers = block.querySelectorAll(':scope > div');
  contentWrappers.forEach((contentWrapper) => {
    contentWrapper.classList.add('business-idea-content-wrapper');

    const contentContainer = contentWrapper.querySelector('div');
    decorateContent(contentContainer);
  });
}