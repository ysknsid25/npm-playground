export component Greeting({ name }: { name?: string }) {
  <div class="card">
    if (name) {
      <p>"Hello, "{name}</p>
    } else {
      <p>"Hello, stranger"</p>
    }
  </div>

  <style>
    .card { padding: 1rem; border: 1px solid #eee; border-radius: 8px; }
  </style>
}