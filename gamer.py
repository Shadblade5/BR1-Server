#!/usr/bin/python
# -*- coding: utf-8 -*-
import cv2
import PIL
import numpy as np
from tkinter import *
from tkinter.filedialog import asksaveasfile, askopenfilename


class Application:

    def __init__(self):

        # Root

        self.window = Tk()
        self.window.title('Brightness/Contrast')
        self.window.geometry('600x600')

        # File Select Button

        self.fsButton = Button(text='Select File',
        command=self.fsHandler)
        self.fsButton.pack()

        # Video Preview

        self.frameIndex = 0
        self.maxFrames = None
        self.previewWindow()

        # Video

        self.video = None
        self.frames = []

        self.window.mainloop()

        # File Button handler

        def fsHandler(self):
            files = [('All Files', '*.*'), ('MP4 Files', '*.mp4')]
            file = askopenfilename(filetypes=files)
            self.video = cv2.VideoCapture(file)
            while self.video.get(cv2.CAP_PROP_POS_FRAMES) \
            < self.video.get(cv2.CAP_PROP_FRAME_COUNT):
            (ret, frame) = self.video.read()
            self.frames.append(frame)
            self.video.set(cv2.CAP_PROP_POS_FRAMES, 0)
            print len(self.frames)

            def previewWindow(self):
                while 1:
                    for frame in self.frames:
                        cv2.imshow('Full Video', frame)


                        app = Application()
