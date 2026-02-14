async function register(){
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  if(res.ok) alert("تم التسجيل");
  else alert(await res.text());
}

async function login(){
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  if(res.ok){ alert("تم الدخول"); loadPosts(); } else alert(await res.text());
}

async function logout(){
  await fetch('/logout'); alert("تم الخروج");
}

async function addPost(){
  const content = document.getElementById('postContent').value;
  const image = document.getElementById('postImage').files[0];
  const form = new FormData();
  form.append('content',content);
  if(image) form.append('image',image);
  await fetch('/posts',{method:'POST',body:form});
  document.getElementById('postContent').value='';
  document.getElementById('postImage').value='';
  loadPosts();
}

async function loadPosts(){
  const res = await fetch('/posts');
  const posts = await res.json();
  const postsDiv = document.getElementById('posts');
  postsDiv.innerHTML='';
  for(const post of posts){
    const div = document.createElement('div');
    div.className='post';
    div.innerHTML=`<b>${post.username}</b>: ${post.content}` + (post.image ? `<img src="/uploads/${post.image}">` : '');
    // التعليقات
    const cDiv = document.createElement('div');
    const commentsRes = await fetch(`/comments/${post.id}`);
    const comments = await commentsRes.json();
    comments.forEach(c=>{ const cm = document.createElement('div'); cm.className='comment'; cm.innerHTML=`<b>${c.username}</b>: ${c.content}`; cDiv.appendChild(cm); });
    div.appendChild(cDiv);
    postsDiv.appendChild(div);
  }
}

loadPosts();