import { useState } from 'react'
import {
  Field,
  FieldArray,
  Form,
  insert,
  remove,
  reset,
  useForm,
} from '@formisch/react'
import { UserSchema, type UserOutput } from '../schemas/userSchema'

export function UserForm() {
  const form = useForm({
    schema: UserSchema,
    initialInput: {
      name: '',
      email: '',
      password: '',
      age: undefined,
      role: undefined,
      interests: [{ value: '' }],
      agreeToTerms: false,
    },
    validate: 'change',
  })

  const [submitted, setSubmitted] = useState<UserOutput | null>(null)

  return (
    <div className="form-card">
      <h1>ユーザー登録フォーム</h1>
      <p className="subtitle">formisch + valibot 検証用</p>

      <Form
        of={form}
        onSubmit={async (output) => {
          await new Promise((r) => setTimeout(r, 400))
          setSubmitted(output)
        }}
        className="form"
      >
        <Field of={form} path={['name']}>
          {(field) => (
            <div className="form-row">
              <label htmlFor="name">名前</label>
              <input
                {...field.props}
                id="name"
                type="text"
                placeholder="山田 太郎"
                value={field.input ?? ''}
              />
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <Field of={form} path={['email']}>
          {(field) => (
            <div className="form-row">
              <label htmlFor="email">メールアドレス</label>
              <input
                {...field.props}
                id="email"
                type="email"
                placeholder="user@example.com"
                value={field.input ?? ''}
              />
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <Field of={form} path={['password']}>
          {(field) => (
            <div className="form-row">
              <label htmlFor="password">パスワード</label>
              <input
                {...field.props}
                id="password"
                type="password"
                placeholder="8文字以上, 大文字+数字"
                value={field.input ?? ''}
              />
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <Field of={form} path={['age']}>
          {(field) => (
            <div className="form-row">
              <label htmlFor="age">年齢</label>
              <input
                {...field.props}
                id="age"
                type="number"
                value={field.input ?? ''}
                onChange={(event) => {
                  const v = event.currentTarget.value
                  field.onChange(v === '' ? undefined : Number(v))
                }}
              />
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <Field of={form} path={['role']}>
          {(field) => (
            <div className="form-row">
              <label htmlFor="role">ロール</label>
              <select
                {...field.props}
                id="role"
                value={field.input ?? ''}
              >
                <option value="">選択してください</option>
                <option value="admin">管理者</option>
                <option value="editor">編集者</option>
                <option value="viewer">閲覧者</option>
              </select>
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <FieldArray of={form} path={['interests']}>
          {(fieldArray) => (
            <div className="form-row">
              <div className="row-header">
                <label>興味のあること</label>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    insert(form, {
                      path: ['interests'],
                      initialInput: { value: '' },
                    })
                  }
                >
                  + 追加
                </button>
              </div>

              {fieldArray.items.map((itemKey, index) => (
                <div className="array-row" key={itemKey}>
                  <Field
                    of={form}
                    path={['interests', index, 'value']}
                  >
                    {(field) => (
                      <div className="array-input">
                        <input
                          {...field.props}
                          type="text"
                          placeholder={`興味 ${index + 1}`}
                          value={field.input ?? ''}
                        />
                        {field.errors && (
                          <p className="error">{field.errors[0]}</p>
                        )}
                      </div>
                    )}
                  </Field>
                  <button
                    type="button"
                    className="ghost danger"
                    onClick={() =>
                      remove(form, { path: ['interests'], at: index })
                    }
                  >
                    削除
                  </button>
                </div>
              ))}

              {fieldArray.errors && (
                <p className="error">{fieldArray.errors[0]}</p>
              )}
            </div>
          )}
        </FieldArray>

        <Field of={form} path={['agreeToTerms']}>
          {(field) => (
            <div className="form-row checkbox-row">
              <label>
                <input
                  {...field.props}
                  type="checkbox"
                  checked={field.input ?? false}
                  onChange={(event) =>
                    field.onChange(event.currentTarget.checked)
                  }
                />
                利用規約に同意する
              </label>
              {field.errors && <p className="error">{field.errors[0]}</p>}
            </div>
          )}
        </Field>

        <div className="actions">
          <button type="submit" disabled={form.isSubmitting}>
            {form.isSubmitting ? '送信中...' : '送信'}
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              reset(form, {})
              setSubmitted(null)
            }}
          >
            リセット
          </button>
        </div>

        <div className="state">
          <span>isDirty: {String(form.isDirty)}</span>
          <span>isValid: {String(form.isValid)}</span>
          <span>isSubmitted: {String(form.isSubmitted)}</span>
        </div>
      </Form>

      {submitted && (
        <pre className="result">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      )}
    </div>
  )
}
