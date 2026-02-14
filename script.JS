async function loadPosts() {
  const res = await fetch('/posts');
  const posts = await res.json();
  const postsDiv = document.getElementById('posts');
  postsDiv.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<p>${post.content}</p>`;
    postsDiv.appendChild(div);
  });
}

async function addPost() {
  const textarea = document.getElementById('postContent');
  const content = textarea.value.trim();
  if(content === "") return alert("المرجو كتابة شيء!");
  
  await fetch('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  textarea.value = '';
  loadPosts();
}

loadPosts();