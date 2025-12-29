export default async function decorate(block) {
  const catalogContainers = block.querySelectorAll(':scope > div');

  catalogContainers.forEach((catalogContainer) => {
    catalogContainer.classList.add('catalog-container');
    const children = catalogContainer.querySelectorAll(':scope > div');

    if(children.length >= 2){
      const pictureContainer = children[0];
      if(pictureContainer){
        pictureContainer.classList.add('picture-container');
      }

      const labelContainer = children[1];
      if(labelContainer){
        labelContainer.classList.add('label-container');

        const link = labelContainer.querySelector('a.button');
        if(link){
          link.classList.remove('button');
        }
      }
    }
  });
}
