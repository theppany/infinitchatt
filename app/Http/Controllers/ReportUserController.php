<?php

namespace App\Http\Controllers;

use App\Models\ReportedUser;
use App\Queries\ReportedUserDataTable;
use App\Repositories\ReportedUserRepository;
use Exception;
use Illuminate\Contracts\View\Factory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use DataTables;
use Illuminate\View\View;

class ReportUserController extends AppBaseController
{
    /**
     * @var ReportedUserRepository
     */
    private $reportedUserRepo;

    /**
     * ReportUserController constructor.
     *
     * @param ReportedUserRepository $reportedUserRepository
     */
    public function __construct(ReportedUserRepository $reportedUserRepository)
    {
        $this->reportedUserRepo = $reportedUserRepository;
    }

    /**
     * Display a listing of the User.
     *
     * @param Request $request
     * 
     * @throws Exception
     * 
     * @return Factory|View
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            return Datatables::of((new ReportedUserDataTable())->get())->make(true);
        }

        return view('reported_users.index');
    }

    /**
     * @param ReportedUser $reportedUser
     *
     * @throws Exception
     *
     * @return JsonResponse
     */
    public function destroy(ReportedUser $reportedUser)
    {
        $this->reportedUserRepo->delete($reportedUser->id);

        return $this->sendSuccess('Reported user deleted successfully.');
    }

    /**
     * @param ReportedUser $reportedUser
     *
     * @return JsonResponse
     */
    public function show(ReportedUser $reportedUser)
    {
        $reportedUser->load(['reportedBy', 'reportedTo']);
        
        return $this->sendData($reportedUser);
    }
}
