export default async function decorate(block) {
  const imageContainer = block.querySelector('picture');
  if(imageContainer){
    imageContainer.classList.add('image-container');
  }
}
