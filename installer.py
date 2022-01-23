# -*- coding: utf-8 -*-
import os
import glob
import shutil
import sys
import time

resourceDir = 'resources'
originalIdx = 'indexStorage'

def explodePDF(filenamebody):
    outPath = f'{resourceDir}{os.sep}{filenamebody}'
    os.makedirs(outPath)
    with open(f'{filenamebody}.pdf', 'rb') as file:
        pdf = file.read()
    fileCount = 0
    pointer = 0
    while True:
        pointer = pdf.find(b"stream", pointer)
        if pointer < 0:
            break
        startPtr = pdf.find(b"\xff\xd8", pointer)
        if startPtr < 0:
            pointer = pointer + 1
            continue
        limit = pdf.find(b"endstream", pointer)
        if limit < 0:
            break
        stopPtr = pdf.find(b"\xff\xd9", pointer, limit) + 2
        pointer = limit + 9
        if stopPtr < 2:
            continue
        fileCount = fileCount + 1
        with open(f'{outPath}{os.sep}image-{str(fileCount)}.jpg', 'wb') as of:
            of.write(pdf[startPtr:stopPtr])
    return fileCount


for filename in glob.glob('*.pdf'):
    filenamebody = os.path.splitext(filename)[0]
    if not os.path.exists(f'{resourceDir}{os.sep}{filenamebody}'):      # resource下にフォルダがない場合のみ処理
        print(f'professing {filenamebody}')
        numOfPages = explodePDF(filenamebody)       # PDFから画像を抽出
        if os.path.exists(f'{originalIdx}{os.sep}{filenamebody}.js'):       # index.jsが用意されている文献
            shutil.copyfile(f'{originalIdx}{os.sep}{filenamebody}.js', f'{resourceDir}{os.sep}{filenamebody}{os.sep}index.js')
        else:       # index.jsが用意されていない文献
            with open(f'{resourceDir}{os.sep}{filenamebody}{os.sep}index.js', 'w') as of:
                of.write(f'maxPage = {numOfPages};\n')
                of.write('indexData = [\n[\n],\n[\n],\n[\n],\n];\n')
        menuname = input('辞書選択メニューに表示する文字列（config.jsから変更可）： ')
        with open('config.js', 'r') as inf:
            readData = inf.readlines()
        for i, elem in enumerate(readData):
            if elem.strip() == '];':
                readData.insert(i, f'    ["{menuname}", "{filenamebody}"],\n')
                break
        with open('newconfig.js', 'w') as of:
            for rec in readData:
                of.write(f'{rec}')
        os.rename('config.js', f'~config-{time.time()}.js')
        os.rename('newconfig.js', 'config.js')

print('終了しました。')