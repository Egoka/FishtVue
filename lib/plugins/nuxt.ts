import { cssComponents } from "fishtvue/component"
import Accordion from "fishtvue/accordion/Accordion.vue"
import Alert from "fishtvue/alert/Alert.vue"
import Aria from "fishtvue/aria/Aria.vue"
import Badge from "fishtvue/badge/Badge.vue"
import Button from "fishtvue/button/Button.vue"
import Calendar from "fishtvue/calendar/Calendar.vue"
import Dialog from "fishtvue/dialog/Dialog.vue"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
import Form from "fishtvue/form/Form.vue"
import Icons from "fishtvue/icons/Icons.vue"
import Input from "fishtvue/input/Input.vue"
import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
import Label from "fishtvue/label/Label.vue"
import Loading from "fishtvue/loading/Loading.vue"
import Menu from "fishtvue/menu/Menu.vue"
import Pagination from "fishtvue/pagination/Pagination.vue"
import Select from "fishtvue/select/Select.vue"
import Separator from "fishtvue/separator/Separator.vue"
import Split from "fishtvue/split/Split.vue"
import Switch from "fishtvue/switch/Switch.vue"
import Table from "fishtvue/table/Table.vue"
import TextEditor from "fishtvue/texteditor/TextEditor.vue"

export default (nuxtApp: any) => {
  if ((process as any).server && nuxtApp.ssrContext) {
    nuxtApp.hook("app:rendered", () => {
      if (cssComponents.size) {
        cssComponents.forEach((style, component) => {
          nuxtApp.ssrContext.head.push({
            style: {
              type: "text/css",
              "data-fishtvue-style-id": component,
              children: style
            }
          })
        })
      }
    })
  }
  const FishtVueComponents = {
    Accordion,
    Alert,
    Aria,
    Badge,
    Button,
    Calendar,
    Dialog,
    FixWindow,
    Icons,
    Input,
    InputLayout,
    Label,
    Loading,
    Menu,
    Pagination,
    Select,
    Separator,
    Split,
    Switch,
    Table,
    TextEditor,
    Form
  }
  Object.keys(FishtVueComponents).forEach((component) =>
    nuxtApp.vueApp.component(component, (FishtVueComponents as any)[component])
  )
}
