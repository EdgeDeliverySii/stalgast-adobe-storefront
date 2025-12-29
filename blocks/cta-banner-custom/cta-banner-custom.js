export default async function decorate(block) {
  const imagesContainer = block.querySelector('p');
  if(imagesContainer){
    imagesContainer.classList.add('images-container');
  }
}
