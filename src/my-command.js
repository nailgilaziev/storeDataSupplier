const sketch = require('sketch')
//const utils = require("./utils");
const {
  DataSupplier
} = sketch
const util = require('util')

export function onStartup() {
  // To register the plugin, uncomment the relevant type:
  DataSupplier.registerDataSupplier('public.text', 'Texts for StorePictures', 'SupplyTexts')
  DataSupplier.registerDataSupplier('public.image', 'Screens for StorePictures', 'SupplyScreens')
}

export function onShutdown() {
  // Deregister the plugin
  DataSupplier.deregisterDataSuppliers()
}

export function onSupplyScreens(context) {
  var folder = chooseFolder()
  supplyData(context, (platform, screen, lang, number) => {
    let path = `${folder}/${platform}/raw/${screen}/${number}.png`
    console.log(path)
    return path
  })
}

export function onSupplyTexts(context) {
  var folder = chooseFolder()
  supplyData(context, (platform, screen, lang, number) => {
    var content = readStringFromFile(`${folder}/texts/${lang}/${number}.txt`)
    if (content == null) content = ''
    return content
  })
}

function supplyData(context, contentFunc) {
  let dataKey = context.data.key
  const items = util.toArray(context.data.items).map(sketch.fromNative)
  items.forEach((item, i) => {
    let name = item.symbolInstance.name.split('/')
    let platform = name[0] == 'i' ? 'iOS' : 'android' 
    let screen = name[1]
    let lang = name[2]
    let number = name[3]
    let content = contentFunc(platform, screen, lang, number)
    DataSupplier.supplyDataAtIndex(dataKey, content, i)
  })
}

function chooseFolder() {
  var panel = NSOpenPanel.openPanel();
  panel.message = "Choose root folder that contains texts and screens folders"
  panel.setCanChooseDirectories(true);
  panel.setCanChooseFiles(false);
  panel.setCanCreateDirectories(false);
  if (panel.runModal() == NSModalResponseOK) {
    return panel.URL().path();
  }
};


function readStringFromFile(filePath) {
  var error = MOPointer.alloc().init();
  var content = NSString.stringWithContentsOfFile_encoding_error(filePath, NSUTF8StringEncoding, error);
  if (error.value() != null) {
    return;
  }
  return String(content);
}