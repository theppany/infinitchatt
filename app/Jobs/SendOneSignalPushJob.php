<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use OneSignal;

class SendOneSignalPushJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private $playerIds;
    private $heading;
    private $message;

    /**
     * Create a new job instance.
     *
     * @param  array  $playerIds
     * @param  string  $heading
     * @param  bool  $message
     */
    public function __construct($playerIds, $heading, $message)
    {
        $this->playerIds = $playerIds;
        $this->heading = $heading;
        $this->message = $message;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $this->sendOneSignalPush($this->playerIds, $this->message, $this->heading);
    }

    /**
     * @param  array  $playerIds
     * @param  string  $message
     * @param  string  $headings
     *
     * @return void|bool
     */
    public function sendOneSignalPush($playerIds, $message, $headings)
    {
        OneSignal::setParam('heading', 'Message Received')->sendNotificationToUser(
            $message,
            $playerIds,
            null,
            null,
            null,
            null,
            $headings
        );

        return true;
    }
}
