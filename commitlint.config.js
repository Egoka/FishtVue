export default {
  parserPreset: { parserOpts: { headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/ } },
  rules: {
    "subject-exclamation-mark": [2, "never"],
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 100],
    "scope-case": [2, "always", "lower-case"],
    "subject-case": [2, "never", ["sentence-case", "start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "type-enum": [
      2,
      "always",
      [
        "BREAKING CHANGE", // major
        "feat", // minor (новая функциональность)
        "fix", // patch (исправление ошибок)
        "build", // сборка
        "ci", // непрерывная интеграция (Continuous Integration)
        "docs", // документация
        "perf", // улучшение производительности (performance)
        "refactor", // рефакторинг кода
        "chore", // внутренние изменения, не связанные с функциональностью или исправлением ошибок
        "revert", // отмена предыдущего коммита
        "style", // изменения в стилях
        "test" // добавление или исправление тестов
      ]
    ]
  },
  extends: ["@commitlint/config-conventional"]
}
// type-enum
// "foo: some message" # fails
// "fix: some message" # passes
//
// type-case
// "FIX: some message" # fails
// "fix: some message" # passes
//
// type-empty
// ": some message" # fails
// "fix: some message" # passes
//
// scope-case
// "fix(SCOPE): some message" # fails
// "fix(scope): some message" # passes
//
// subject-case
// "fix(SCOPE): Some message" # fails
// "fix(SCOPE): Some Message" # fails
// "fix(SCOPE): SomeMessage" # fails
// "fix(SCOPE): SOMEMESSAGE" # fails
// "fix(scope): some message" # passes
// "fix(scope): some Message" # passes
//
// subject-empty
// echo "fix:" # fails
// echo "fix: some message" # passes
//
// subject-full-stop
// echo "fix: some message." # fails
// echo "fix: some message" # passes
//
// header-max-length
// echo "fix: some message that is way too long and breaks the line max-length by several characters" # fails
// echo "fix: some message" # passes
