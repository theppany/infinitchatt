<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddHardDeleteFieldIntoMessageActionTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('message_action', function (Blueprint $table) {
            $table->tinyInteger('is_hard_delete')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('message_action', function (Blueprint $table) {
            $table->dropColumn('is_hard_delete');
        });
    }
}
