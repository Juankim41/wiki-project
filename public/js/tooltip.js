document.addEventListener('mouseover', function (e) {
  if (e.target.classList.contains('footnote-ref')) {
    const tooltip = document.getElementById('tooltip');
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    tooltip.style.display = 'block';
    tooltip.style.top = e.pageY + 10 + 'px';
    tooltip.style.left = e.pageX + 10 + 'px';
  }
});

document.addEventListener('mouseout', function (e) {
  if (e.target.classList.contains('footnote-ref')) {
    document.getElementById('tooltip').style.display = 'none';
  }
});
