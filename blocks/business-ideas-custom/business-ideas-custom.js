export default async function decorate(block) {
  const sectionContainer = block.closest('div.section');
  const sectionTitle = sectionContainer.querySelector('div > h2');
  if(sectionTitle){
    sectionTitle.classList.add('business-ideas-section-title');
  }

  const businessIdeaContainers = block.querySelectorAll(':scope > div');
  businessIdeaContainers.forEach((businessIdeaContainer) => {
    businessIdeaContainer.classList.add('business-idea-container');

    const children = businessIdeaContainer.querySelectorAll(':scope > div');
    if(children.length > 1){
      const pictureContainer = children[0];
      pictureContainer.classList.add('picture-container');

      const labelContainer = children[1];
      labelContainer.classList.add('label-container');
      const link = labelContainer.querySelector('a');
      if(link){
        link.classList.remove('button');
        businessIdeaContainer.addEventListener('click', () => {
          link.click();
        });
      }
    }
  });
}