<?php
/**
 * Company: InfyOm Technologies, Copyright 2019, All Rights Reserved.
 *
 * User: Monika Vaghasiya
 * Email: monika.vaghasiya@infyom.com
 * Date: 11/13/2019
 * Time: 01:14 PM
 */

namespace App\Queries;

use App\Models\ReportedUser;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class UserDataTable.
 */
class ReportedUserDataTable
{
    /**
     * @return Builder
     */
    public function get()
    {
        return ReportedUser::with(['reportedBy', 'reportedTo'])
            ->whereHas('reportedBy')
            ->whereHas('reportedTo')
            ->select('reported_users.*');
    }
}
