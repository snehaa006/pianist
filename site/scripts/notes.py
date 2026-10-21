# The notes she plays in the site's piano recording (public/media/audio/at-home-grand.*), for the hero keyboard to
# play along: public/media/audio/at-home-grand.notes.json, {"notes": [[start s, end s, MIDI note, velocity 0..1], ...]}
# in order of start.
#
# Transcribed by Spotify's Basic Pitch (its ONNX model, so TensorFlow is not needed). In a virtual environment:
#   pip install --no-deps basic-pitch==0.4.0
#   pip install onnxruntime numpy scipy librosa "resampy<0.4.3" pretty_midi mir_eval scikit-learn "setuptools<81"
#   python -I scripts/notes.py
# Needs ffmpeg.
import json, os, subprocess, tempfile

from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, '..', 'public', 'media', 'audio', 'at-home-grand.m4a')
OUT = os.path.join(HERE, '..', 'public', 'media', 'audio', 'at-home-grand.notes.json')


def main():
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'grand.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', AUDIO, '-ac', '1', '-ar', '22050', wav], check=True)
        _, _, events = predict(wav, ICASSP_2022_MODEL_PATH)  # the model's own thresholds
    notes = sorted([round(float(s), 3), round(float(e), 3), int(m), round(float(v), 2)] for s, e, m, v, _ in events)
    with open(OUT, 'w') as f:
        json.dump({'notes': notes}, f, separators=(',', ':'))
    print(OUT, len(notes), 'notes')


if __name__ == '__main__':
    main()
