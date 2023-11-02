import winsound
import time
 
notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88] 
durations = [500, 500, 1000, 500, 500, 1000, 500, 500, 500, 500, 1000, 500, 500, 1000, 500, 500, 1000]

# Play "Happy Birthday" melody
for note, duration in zip(notes, durations):
    winsound.Beep(int(note), duration)

    # Pause between notes
    time.sleep(0.1)
