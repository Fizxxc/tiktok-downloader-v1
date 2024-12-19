document.getElementById('downloadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const videoUrl = document.getElementById('videoUrl').value.trim();
  const resultDiv = document.getElementById('result');
  const downloadLink = document.getElementById('downloadLink');

  if (!videoUrl || !videoUrl.includes('tiktok.com')) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid URL',
      text: 'Please enter a valid TikTok URL.',
    });
    return;
  }

  Swal.fire({
    title: 'Processing...',
    text: 'Please wait while we process your request.',
    icon: 'info',
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  try {
    const response = await fetch('/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: videoUrl }),
    });

    const data = await response.json();

    if (data.videoUrl) {
      Swal.fire({
        icon: 'success',
        title: 'Download Ready',
        text: 'Click the link below to download your video.',
        showConfirmButton: true,
        confirmButtonText: 'Download',
        footer: `<a href="${data.videoUrl}" target="_blank">Download Now</a>`,
      });

      downloadLink.href = data.videoUrl;
      resultDiv.classList.remove('hidden');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'Could not process the TikTok video. Please try again later.',
      });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Server Error',
      text: 'An error occurred. Please try again later.',
    });
  }
});
