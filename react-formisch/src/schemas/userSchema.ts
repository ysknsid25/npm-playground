import * as v from 'valibot'

export const UserSchema = v.object({
  name: v.pipe(
    v.string(),
    v.minLength(1, '名前を入力してください'),
    v.maxLength(20, '名前は20文字以内で入力してください'),
  ),
  email: v.pipe(
    v.string(),
    v.minLength(1, 'メールアドレスを入力してください'),
    v.email('メールアドレスの形式が正しくありません'),
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'パスワードは8文字以上にしてください'),
    v.regex(/[A-Z]/, '大文字を1つ以上含めてください'),
    v.regex(/[0-9]/, '数字を1つ以上含めてください'),
  ),
  age: v.pipe(
    v.number('年齢は数値で入力してください'),
    v.minValue(0, '0以上で入力してください'),
    v.maxValue(150, '150以下で入力してください'),
  ),
  role: v.picklist(
    ['admin', 'editor', 'viewer'],
    'ロールを選択してください',
  ),
  interests: v.pipe(
    v.array(
      v.object({
        value: v.pipe(
          v.string(),
          v.minLength(1, '興味は空欄にできません'),
        ),
      }),
    ),
    v.minLength(1, '少なくとも1つは入力してください'),
  ),
  agreeToTerms: v.pipe(
    v.boolean(),
    v.literal(true, '利用規約に同意してください'),
  ),
})

export type UserInput = v.InferInput<typeof UserSchema>
export type UserOutput = v.InferOutput<typeof UserSchema>
