import { useEffect, useState } from 'react';
import { Bookmark, NotebookPen } from 'lucide-react';
import { isBookmarked } from '../lib/userData';
import { useUserData } from '../store/UserDataContext';

/** ブックマークの切替えボタン */
export function BookmarkButton({ id }: { id: string }) {
  const { data, toggleBookmark } = useUserData();
  const on = isBookmarked(data, id);
  return (
    <button
      type="button"
      className={`bookmark ${on ? 'bookmark-on' : ''}`}
      aria-pressed={on}
      onClick={() => toggleBookmark(id)}
      title={on ? 'ブックマークを外す' : 'ブックマークする'}
    >
      <Bookmark size={16} fill={on ? 'currentColor' : 'none'} aria-hidden="true" />
      {on ? 'ブックマーク中' : 'ブックマーク'}
    </button>
  );
}

/** 問題ごとのメモ。入力欄から離れたときに保存する */
export function NoteEditor({ id }: { id: string }) {
  const { data, setNote } = useUserData();
  const saved = data.notes[id]?.text ?? '';
  const [text, setText] = useState(saved);

  // 別の問題に移ったときや、他の画面で更新されたときに追従する
  useEffect(() => {
    setText(saved);
  }, [id, saved]);

  const commit = () => {
    if (text !== saved) setNote(id, text);
  };

  return (
    <div className="note">
      <label htmlFor={`note-${id}`} className="note-label">
        <NotebookPen size={16} aria-hidden="true" />
        メモ
      </label>
      <textarea
        id={`note-${id}`}
        rows={3}
        placeholder="覚えておきたいことを書いておけます"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
      />
      {text !== saved && <span className="hint">入力欄の外をタップすると保存されます</span>}
    </div>
  );
}
