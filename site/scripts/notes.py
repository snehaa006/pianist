# The notes she plays in each of the site's piano recordings (public/media/audio/<slug>.*, cut by process-media.sh),
# for the keys that play along (the hero keyboard, the stairs): public/media/audio/<slug>.notes.json,
# {"notes": [[start s, end s, MIDI note, velocity 0..1], ...]} in order of start.
#
# Transcribed by Spotify's Basic Pitch (its ONNX model, so TensorFlow is not needed). In a virtual environment:
#   pip install --no-deps basic-pitch==0.4.0
#   pip install onnxruntime numpy scipy librosa "resampy<0.4.3" pretty_midi mir_eval scikit-learn "setuptools<81"
#   python -I scripts/notes.py                    # every recording
#   python -I scripts/notes.py dog-hungry andante # just these
# Needs ffmpeg.
import json, os, subprocess, sys, tempfile

from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, '..', 'public', 'media', 'audio')


def transcribe(slug):
    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, 'piece.wav')
        src = os.path.join(AUDIO, f'{slug}.m4a')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '22050', wav], check=True)
        _, _, events = predict(wav, ICASSP_2022_MODEL_PATH)  # the model's own thresholds
    notes = sorted([round(float(s), 3), round(float(e), 3), int(m), round(float(v), 2)] for s, e, m, v, _ in events)
    out = os.path.join(AUDIO, f'{slug}.notes.json')
    with open(out, 'w') as f:
        json.dump({'notes': notes}, f, separators=(',', ':'))
    print(out, len(notes), 'notes')


def main():
    slugs = sys.argv[1:] or sorted(f[:-4] for f in os.listdir(AUDIO) if f.endswith('.m4a'))
    for slug in slugs:
        transcribe(slug)


if __name__ == '__main__':
    main()
