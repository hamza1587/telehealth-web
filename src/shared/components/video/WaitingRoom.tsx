import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, MicOff, VideoOff, Settings } from 'lucide-react';

interface Device {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
}

interface WaitingRoomProps {
  onJoinCall: () => void;
  isDoctor?: boolean;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ onJoinCall, isDoctor = false }) => {
  const [cameras, setCameras] = useState<Device[]>([]);
  const [microphones, setMicrophones] = useState<Device[]>([]);
  const [speakers, setSpeakers] = useState<Device[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    enumerateDevices();
    startPreview();
    return () => {
      if (previewStream) {
        previewStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Camera ${d.deviceId.slice(0, 8)}`,
        kind: d.kind as 'videoinput'
      }));
      const audioDevices = devices.filter(d => d.kind === 'audioinput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
        kind: d.kind as 'audioinput'
      }));
      const speakerDevices = devices.filter(d => d.kind === 'audiooutput').map(d => ({
        deviceId: d.deviceId,
        label: d.label || `Speaker ${d.deviceId.slice(0, 8)}`,
        kind: d.kind as 'audiooutput'
      }));

      setCameras(videoDevices);
      setMicrophones(audioDevices);
      setSpeakers(speakerDevices);

      if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
      if (audioDevices.length > 0) setSelectedMicrophone(audioDevices[0].deviceId);
      if (speakerDevices.length > 0) setSelectedSpeaker(speakerDevices[0].deviceId);
    } catch (error) {
      console.error('Error enumerating devices:', error);
    }
  };

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPreviewStream(stream);
    } catch (error) {
      console.error('Error starting preview:', error);
    }
  };

  const toggleCamera = useCallback(() => {
    setCameraEnabled(!cameraEnabled);
    if (previewStream) {
      previewStream.getVideoTracks().forEach(track => {
        track.enabled = !cameraEnabled;
      });
    }
  }, [cameraEnabled, previewStream]);

  const toggleMicrophone = useCallback(() => {
    setMicEnabled(!micEnabled);
    if (previewStream) {
      previewStream.getAudioTracks().forEach(track => {
        track.enabled = !micEnabled;
      });
    }
  }, [micEnabled, previewStream]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.target instanceof HTMLButtonElement) {
        e.target.click();
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {isDoctor ? 'Doctor Waiting Room' : 'Patient Waiting Room'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {previewStream && cameraEnabled ? (
              <video
                autoPlay
                muted
                playsInline
                ref={video => {
                  if (video) video.srcObject = previewStream;
                }}
                className="w-full h-full object-cover"
                aria-label="Camera preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white" aria-hidden="true">
                <VideoOff className="w-12 h-12" />
              </div>
            )}
            <Badge className="absolute top-2 left-2" variant={cameraEnabled ? "default" : "secondary"}>
              {cameraEnabled ? "Camera On" : "Camera Off"}
            </Badge>
          </div>

          {/* Device Controls */}
          <div className="flex justify-center gap-4" role="group" aria-label="Device controls">
            <Button
              variant={micEnabled ? "default" : "destructive"}
              size="icon"
              onClick={toggleMicrophone}
              aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
              onKeyDown={handleKeyDown}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            <Button
              variant={cameraEnabled ? "default" : "destructive"}
              size="icon"
              onClick={toggleCamera}
              aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
              onKeyDown={handleKeyDown}
            >
              {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              aria-label="Device settings"
              disabled
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Device Selectors */}
          <div className="space-y-4" role="group" aria-label="Device selection">
            <div>
              <label htmlFor="camera-select" className="text-sm font-medium">Camera</label>
              <select
                id="camera-select"
                value={selectedCamera}
                onChange={e => setSelectedCamera(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {cameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="mic-select" className="text-sm font-medium">Microphone</label>
              <select
                id="mic-select"
                value={selectedMicrophone}
                onChange={e => setSelectedMicrophone(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {microphones.map(mic => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="speaker-select" className="text-sm font-medium">Speaker</label>
              <select
                id="speaker-select"
                value={selectedSpeaker}
                onChange={e => setSelectedSpeaker(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              >
                {speakers.map(speaker => (
                  <option key={speaker.deviceId} value={speaker.deviceId}>
                    {speaker.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Join Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={onJoinCall}
            aria-label="Join consultation"
          >
            Join Consultation
          </Button>

          {/* Status */}
          <div className="text-center text-sm text-muted-foreground" aria-live="polite">
            <p>Ready to join? Click the button above when you're ready.</p>
            <p className="mt-2" role="status">
              <Badge variant="outline" aria-label="Call status: Waiting for other participant">Waiting for other participant</Badge>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};