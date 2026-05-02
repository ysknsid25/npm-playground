type User = {
  id: number;
  name: string;
  admin: boolean;
  bio?: string;
};

type Props = {
  users: User[];
  showBio?: boolean;
};

export component UserList({ users, showBio }: Props) {
  <ul class="user-list">
    for (const user of users; key user.id) {
      const initials = user.name.slice(0, 2).toUpperCase();
      const role = user.admin ? 'Admin' : 'Member';

      <li class="user-row">
        <span class="avatar">{initials}</span>
        <strong>{user.name}</strong>
        <span class="badge">{role}</span>

        if (showBio && user.bio) {
          const shortBio = user.bio.slice(0, 140);
          <p class="bio">{shortBio}</p>
        }
      </li>
    }
  </ul>

  <style>
    .user-list { list-style: none; padding: 0; }
    .user-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
    .avatar { width: 2rem; height: 2rem; background: #ddd; border-radius: 50%; display: grid; place-items: center; font-size: 0.75rem; }
    .badge { font-size: 0.75rem; padding: 0.1rem 0.4rem; background: #f0f0f0; border-radius: 4px; }
    .bio { font-size: 0.875rem; color: #666; margin: 0.25rem 0 0; }
  </style>
}